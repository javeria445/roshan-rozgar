import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { distanceKm } from "@/lib/geo";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const trade = searchParams.get("trade");
  const lat = parseFloat(searchParams.get("lat") ?? "33.6844");
  const lng = parseFloat(searchParams.get("lng") ?? "73.0479");

  const workers = await prisma.worker.findMany({
    where: { status: "free", ...(trade ? { trade } : {}) },
  });

  const result = workers
    .map((w) => {
      const km = distanceKm(lat, lng, w.lat, w.lng);
      return {
        ...w,
        skills: JSON.parse(w.skills),
        areas: JSON.parse(w.areas),
        trustTags: JSON.parse(w.trustTags),
        distanceKm: Math.round(km * 10) / 10,
        // lower is better: distance matters most, rating pulls a worker up
        score: km - w.ratingAvg * 0.8,
      };
    })
    .sort((a, b) => a.score - b.score);

  return NextResponse.json({ workers: result });
}