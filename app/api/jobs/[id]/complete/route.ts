import { NextResponse } from "next/server";
import { completeJob } from "@/lib/booking";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const job = await completeJob(id);
    return NextResponse.json({ job });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "UNKNOWN" }, { status: 400 });
  }
}