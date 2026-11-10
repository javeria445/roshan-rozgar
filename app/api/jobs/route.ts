import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const { customerId, trade, description, urgency, workerId } = await req.json();

  if (!customerId || !trade || !description) {
    return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 });
  }

  const job = await prisma.job.create({
    data: {
      customerId,
      trade,
      description,
      urgency: urgency ?? "normal",
      workerId: workerId ?? null,
      status: workerId ? "negotiating" : "requested",
    },
  });

  return NextResponse.json({ job });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const workerId = searchParams.get("workerId");
  const customerId = searchParams.get("customerId");

  const jobs = await prisma.job.findMany({
    where: {
      ...(workerId ? { workerId } : {}),
      ...(customerId ? { customerId } : {}),
    },
    include: { customer: true, worker: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ jobs });
}import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await prisma.job.findUnique({
    where: { id },
    include: { messages: { orderBy: { createdAt: "asc" } }, worker: true, customer: true },
  });
  if (!job) return NextResponse.json({ error: "JOB_NOT_FOUND" }, { status: 404 });
  return NextResponse.json({ job });
}