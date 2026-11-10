import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { geminiJSON } from "@/lib/ai/gemini";

export async function POST(req: Request) {
  const { jobId, stars, text } = await req.json();
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job?.workerId) return NextResponse.json({ error: "JOB_NOT_FOUND" }, { status: 404 });

  let tags: string[] = [];
  if (text) {
    try {
      const r = await geminiJSON<{ tags: string[] }>(
        `Customer review (Urdu / Roman Urdu / English): """${text}"""
Return ONLY JSON {"tags": up to 3 short English tags from: punctual, clean work, fair price, skilled, polite, fast, trustworthy, late, overpriced}.`
      );
      tags = r.tags ?? [];
    } catch {}
  }

  const review = await prisma.review.create({
    data: { jobId, workerId: job.workerId, stars: Number(stars), text: text ?? "", tags: JSON.stringify(tags) },
  });

  const all = await prisma.review.findMany({ where: { workerId: job.workerId }, orderBy: { createdAt: "desc" } });
  const avg = all.reduce((s, r) => s + r.stars, 0) / all.length;

  let trustTags: string[] = [];
  let summary = "";
  try {
    const r = await geminiJSON<{ tags: string[]; summary: string }>(
      `Reviews of a tradesperson: ${JSON.stringify(all.slice(0, 15).map((x) => ({ stars: x.stars, text: x.text })))}
Return ONLY JSON {"tags": top 3 strengths as short English tags, "summary": one short honest sentence in Urdu that helps the next customer decide}.`
    );
    trustTags = r.tags ?? [];
    summary = r.summary ?? "";
  } catch {
    const counts: Record<string, number> = {};
    all.forEach((x) => (JSON.parse(x.tags) as string[]).forEach((t) => (counts[t] = (counts[t] ?? 0) + 1)));
    trustTags = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t]) => t);
  }

  const worker = await prisma.worker.update({
    where: { id: job.workerId },
    data: {
      ratingAvg: Math.round(avg * 10) / 10,
      ratingCount: all.length,
      trustTags: JSON.stringify(trustTags),
      ...(summary ? { trustSummary: summary } : {}),
    },
  });
  return NextResponse.json({ review, worker });
}