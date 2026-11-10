import { NextResponse } from "next/server";
import { transcribe } from "@/lib/ai/groq";
import { geminiJSON } from "@/lib/ai/gemini";

type Result = { trade: string; urgency: "normal" | "urgent"; cause: string; summary: string };

export async function POST(req: Request) {
  try {
    let text = "";
    let image: { mimeType: string; data: string } | undefined;

    if (req.headers.get("content-type")?.includes("multipart")) {
      const form = await req.formData();
      const audio = form.get("audio") as File | null;
      const photo = form.get("photo") as File | null;
      if (audio) text = await transcribe(audio, audio.name || "audio.webm");
      if (photo) {
        const buf = Buffer.from(await photo.arrayBuffer());
        image = { mimeType: photo.type || "image/jpeg", data: buf.toString("base64") };
      }
      text = text || (form.get("text") as string) || "";
    } else {
      text = (await req.json()).text ?? "";
    }

    if (!text && !image) return NextResponse.json({ error: "NO_INPUT" }, { status: 400 });

    const result = await geminiJSON<Result>(
      `A household in Pakistan describes a problem (Urdu / Roman Urdu / English), possibly with a photo.
Description: """${text}"""
Return ONLY JSON: {"trade": "electrician"|"plumber"|"ac"|"carpenter"|"mechanic",
"urgency": "normal"|"urgent" (urgent for sparks, gas, flooding, no power at all),
"cause": short likely cause in English, "summary": one short Urdu sentence describing the job}`,
      image
    );
    return NextResponse.json({ transcript: text, ...result });
  } catch (e) {
    return NextResponse.json({ error: "AI_FAILED", detail: String(e) }, { status: 502 });
  }
}