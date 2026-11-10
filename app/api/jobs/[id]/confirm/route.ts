import { NextResponse } from "next/server";
import { confirmJob } from "@/lib/booking";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { workerId, price } = await req.json();

  try {
    const job = await confirmJob(id, workerId, Number(price));
    return NextResponse.json({ job });
  } catch (e) {
    const code = e instanceof Error ? e.message : "UNKNOWN";
    const status = code === "WORKER_UNAVAILABLE" || code === "JOB_ALREADY_CONFIRMED" ? 409 : 400;
    return NextResponse.json({ error: code }, { status });
  }
}