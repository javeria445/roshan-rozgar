import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const trade = new URL(req.url).searchParams.get("trade");
  const prices = await prisma.priceRef.findMany({ where: trade ? { trade } : {} });
  return NextResponse.json({ prices });
}