import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { transcribe } from "@/lib/ai/groq";

export async function POST(req: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const form = await req.formData();
  const audio = form.get("audio") as File | null;
  const sender = form.get("sender") as string;
  if (!audio || !["customer", "worker"].includes(sender)) {
    return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
  }
  let text = "(voice note)";
  try { text = (await transcribe(audio, audio.name || "audio.webm")) || text; } catch {}
  const message = await prisma.message.create({ data: { jobId, sender, text } });
  await prisma.job.updateMany({ where: { id: jobId, status: "requested" }, data: { status: "negotiating" } });
  return NextResponse.json({ message });
}