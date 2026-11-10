import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { geminiJSON } from "@/lib/ai/gemini";

export async function POST(req: Request) {
  const { trade, description } = await req.json();
  const refs = await prisma.priceRef.findMany({ where: { trade } });
  try {
    const r = await geminiJSON<{ min: number; max: number; reason: string }>(
      `Job: "${description}" (trade: ${trade}). Market reference prices in PKR: ${JSON.stringify(refs)}.
Return ONLY JSON {"min": number, "max": number, "reason": one short Urdu sentence}. Stay within the reference ranges unless the job clearly differs.`
    );
    return NextResponse.json(r);
  } catch {
    const min = refs.length ? Math.min(...refs.map((x) => x.minPrice)) : 500;
    const max = refs.length ? Math.max(...refs.map((x) => x.maxPrice)) : 2000;
    return NextResponse.json({ min, max, reason: "" });
  }
}