const base = "http://localhost:3000";
const post = (url, body) =>
  fetch(base + url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => ({ status: r.status, body: await r.json() }));

const { workers } = await fetch(base + "/api/workers?trade=electrician").then((r) => r.json());
const w = workers[0];
console.log("1. worker:", w.name, w.id);

const job = (await post("/api/jobs", { customerId: "demo-customer-1", trade: "electrician", description: "socket se chingari", workerId: w.id })).body.job;
console.log("2. job:", job.id, job.status);

console.log("3. chat:", (await post(`/api/chat/${job.id}`, { sender: "customer", text: "kitne paise lo ge?" })).status);
console.log("4. price:", JSON.stringify((await post("/api/price/suggest", { trade: "electrician", description: "socket repair" })).body));

console.log("5. confirm:", JSON.stringify((await post(`/api/jobs/${job.id}/confirm`, { workerId: w.id, price: 800 })).body.job?.status));
console.log("6. complete:", JSON.stringify((await post(`/api/jobs/${job.id}/complete`, {})).body.job?.status));

const rev = await post("/api/review", { jobId: job.id, stars: 5, text: "waqt par aaya aur kaam saaf kiya" });
console.log("7. review:", rev.status, rev.body.worker?.trustTags, rev.body.worker?.trustSummary);