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
}