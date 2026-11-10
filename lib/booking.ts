import { prisma } from "@/lib/db";

export async function confirmJob(jobId: string, workerId: string, price: number) {
  return prisma.$transaction(async (tx) => {
    const job = await tx.job.findUnique({ where: { id: jobId } });
    if (!job) throw new Error("JOB_NOT_FOUND");
    if (job.status === "confirmed" || job.status === "completed") {
      throw new Error("JOB_ALREADY_CONFIRMED");
    }

    // Atomic: matches only if the worker is STILL free
    const locked = await tx.worker.updateMany({
      where: { id: workerId, status: "free" },
      data: { status: "engaged" },
    });
    if (locked.count === 0) throw new Error("WORKER_UNAVAILABLE");

    return tx.job.update({
      where: { id: jobId },
      data: { status: "confirmed", workerId, agreedPrice: price },
    });
  });
}

export async function completeJob(jobId: string) {
  return prisma.$transaction(async (tx) => {
    const job = await tx.job.findUnique({ where: { id: jobId } });
    if (!job || job.status !== "confirmed" || !job.workerId) {
      throw new Error("JOB_NOT_CONFIRMED");
    }
    await tx.worker.update({ where: { id: job.workerId }, data: { status: "free" } });
    return tx.job.update({
      where: { id: jobId },
      data: { status: "completed", completedAt: new Date() },
    });
  });
}