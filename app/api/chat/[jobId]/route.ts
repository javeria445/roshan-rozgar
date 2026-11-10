import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const messages = await prisma.message.findMany({ where: { jobId }, orderBy: { createdAt: "asc" } });
  return NextResponse.json({ messages });
}

export async function POST(req: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const { sender, text } = await req.json();
  if (!["customer", "worker"].includes(sender) || !text) {
    return NextResponse.json({ error: "BAD_MESSAGE" }, { status: 400 });
  }
  const message = await prisma.message.create({ data: { jobId, sender, text } });
  await prisma.job.updateMany({ where: { id: jobId, status: "requested" }, data: { status: "negotiating" } });
  return NextResponse.json({ message });
}