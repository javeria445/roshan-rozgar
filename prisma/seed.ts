import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Seed = {
  name: string;
  trade: "electrician" | "plumber" | "ac" | "carpenter" | "mechanic";
  areas: string[];
  skills: string[];
  exp: number;
  rate: number;
  lat: number;
  lng: number;
  status?: "free" | "engaged" | "offline";
};

const workers: Seed[] = [
  // Electricians
  { name: "Muhammad Aslam", trade: "electrician", areas: ["G-9", "G-10"], skills: ["wiring", "short circuit", "fan fitting"], exp: 15, rate: 800, lat: 33.6965, lng: 73.036 },
  { name: "Tariq Mehmood", trade: "electrician", areas: ["I-8", "I-9"], skills: ["socket repair", "DB board", "generator"], exp: 9, rate: 600, lat: 33.667, lng: 73.075 },
  { name: "Naveed Akhtar", trade: "electrician", areas: ["Saddar", "Satellite Town"], skills: ["wiring", "inverter", "lights"], exp: 12, rate: 500, lat: 33.597, lng: 73.048, status: "engaged" },
  // Plumbers
  { name: "Rashid Ali", trade: "plumber", areas: ["F-10", "F-11"], skills: ["leakage", "geyser", "tank fitting"], exp: 18, rate: 700, lat: 33.694, lng: 73.012 },
  { name: "Imran Khan", trade: "plumber", areas: ["G-11", "G-10"], skills: ["pipe fitting", "drain blockage", "bathroom"], exp: 7, rate: 500, lat: 33.668, lng: 72.997 },
  { name: "Shahid Iqbal", trade: "plumber", areas: ["Bahria Town", "DHA"], skills: ["leakage", "water pump", "kitchen"], exp: 11, rate: 800, lat: 33.53, lng: 73.13 },
  // AC technicians
  { name: "Zafar Iqbal", trade: "ac", areas: ["F-7", "F-8", "Blue Area"], skills: ["gas filling", "AC service", "inverter AC"], exp: 10, rate: 1000, lat: 33.72, lng: 73.056 },
  { name: "Bilal Ahmed", trade: "ac", areas: ["I-8", "H-8"], skills: ["AC installation", "compressor", "cleaning"], exp: 6, rate: 800, lat: 33.682, lng: 73.048 },
  { name: "Kamran Shah", trade: "ac", areas: ["Satellite Town", "Commercial Market"], skills: ["gas filling", "PCB repair"], exp: 14, rate: 900, lat: 33.637, lng: 73.062, status: "offline" },
  // Carpenters
  { name: "Arif Hussain", trade: "carpenter", areas: ["G-9", "I-9"], skills: ["door repair", "wardrobe", "polish"], exp: 20, rate: 700, lat: 33.65, lng: 73.038 },
  { name: "Waseem Abbas", trade: "carpenter", areas: ["Saddar", "Chaklala"], skills: ["furniture repair", "kitchen cabinets"], exp: 8, rate: 600, lat: 33.608, lng: 73.098 },
  { name: "Hanif Masih", trade: "carpenter", areas: ["F-10", "G-10"], skills: ["doors", "windows", "bed repair"], exp: 13, rate: 650, lat: 33.69, lng: 73.02 },
  // Mechanics
  { name: "Sajid Mehmood", trade: "mechanic", areas: ["I-9", "I-10"], skills: ["car engine", "brakes", "oil change"], exp: 16, rate: 1000, lat: 33.65, lng: 73.04 },
  { name: "Nadeem Butt", trade: "mechanic", areas: ["Saddar", "Commercial Market"], skills: ["bike repair", "puncture", "tuning"], exp: 9, rate: 400, lat: 33.601, lng: 73.055 },
  { name: "Ghulam Abbas", trade: "mechanic", areas: ["G-11", "G-10"], skills: ["car AC", "battery", "suspension"], exp: 12, rate: 900, lat: 33.668, lng: 73.0 },
];

const reviewPool = [
  { stars: 5, text: "Waqt par aaya aur kaam saaf kiya", tags: ["punctual", "clean work"] },
  { stars: 5, text: "Theek price, achi quality", tags: ["fair price", "skilled"] },
  { stars: 4, text: "Kaam acha tha, thora late aaya", tags: ["skilled"] },
  { stars: 5, text: "Bohat tameez se pesh aaya", tags: ["polite", "trustworthy"] },
  { stars: 4, text: "Masla jaldi hal kar diya", tags: ["fast", "skilled"] },
];

const prices = [
  { trade: "electrician", task: "socket or switch repair", minPrice: 500, maxPrice: 1000 },
  { trade: "electrician", task: "fan installation", minPrice: 400, maxPrice: 800 },
  { trade: "electrician", task: "short circuit fault", minPrice: 800, maxPrice: 2000 },
  { trade: "plumber", task: "tap or pipe leakage", minPrice: 500, maxPrice: 1200 },
  { trade: "plumber", task: "drain blockage", minPrice: 600, maxPrice: 1500 },
  { trade: "plumber", task: "geyser repair", minPrice: 800, maxPrice: 2000 },
  { trade: "ac", task: "AC service and cleaning", minPrice: 1500, maxPrice: 3000 },
  { trade: "ac", task: "gas filling", minPrice: 3000, maxPrice: 6000 },
  { trade: "ac", task: "AC installation", minPrice: 2500, maxPrice: 5000 },
  { trade: "carpenter", task: "door or lock repair", minPrice: 500, maxPrice: 1500 },
  { trade: "carpenter", task: "wardrobe or cabinet repair", minPrice: 1000, maxPrice: 3000 },
  { trade: "mechanic", task: "car oil change", minPrice: 800, maxPrice: 1500 },
  { trade: "mechanic", task: "brake repair", minPrice: 1500, maxPrice: 4000 },
  { trade: "mechanic", task: "bike puncture or tuning", minPrice: 200, maxPrice: 800 },
];

async function main() {
  await prisma.message.deleteMany();
  await prisma.review.deleteMany();
  await prisma.job.deleteMany();
  await prisma.worker.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.priceRef.deleteMany();

  await prisma.priceRef.createMany({ data: prices });

  // Fixed IDs so every teammate can use them while testing
  await prisma.customer.createMany({
    data: [
      { id: "demo-customer-1", name: "Ayesha (demo)", lat: 33.6844, lng: 73.0479 },
      { id: "demo-customer-2", name: "Hamza (demo)", lat: 33.6844, lng: 73.0479 },
    ],
  });

  for (let i = 0; i < workers.length; i++) {
    const w = workers[i];
    const worker = await prisma.worker.create({
      data: {
        name: w.name,
        trade: w.trade,
        areas: JSON.stringify(w.areas),
        skills: JSON.stringify(w.skills),
        experience: w.exp,
        visitRate: w.rate,
        lat: w.lat,
        lng: w.lng,
        status: w.status ?? "free",
      },
    });

    // 2 or 3 completed jobs with reviews per worker
    const count = 2 + (i % 2);
    const picked = [];
    for (let j = 0; j < count; j++) {
      const r = reviewPool[(i + j) % reviewPool.length];
      picked.push(r);
      const job = await prisma.job.create({
        data: {
          customerId: "demo-customer-1",
          workerId: worker.id,
          trade: w.trade,
          description: `${w.skills[j % w.skills.length]} kaam`,
          status: "completed",
          agreedPrice: w.rate + 200 * j,
          completedAt: new Date(),
        },
      });
      await prisma.review.create({
        data: { jobId: job.id, workerId: worker.id, stars: r.stars, text: r.text, tags: JSON.stringify(r.tags) },
      });
    }

    const avg = picked.reduce((s, r) => s + r.stars, 0) / picked.length;
    const tagCount: Record<string, number> = {};
    picked.forEach((r) => r.tags.forEach((t) => (tagCount[t] = (tagCount[t] ?? 0) + 1)));
    const topTags = Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t]) => t);

    await prisma.worker.update({
      where: { id: worker.id },
      data: {
        ratingAvg: Math.round(avg * 10) / 10,
        ratingCount: picked.length,
        trustTags: JSON.stringify(topTags),
        trustSummary: `Customers describe ${w.name} as ${topTags.join(", ")}.`,
      },
    });
  }

  console.log(`Seeded ${workers.length} workers, 2 demo customers, ${prices.length} price references.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());