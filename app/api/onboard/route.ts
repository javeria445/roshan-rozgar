import { NextResponse } from "next/server";
import { transcribe } from "@/lib/ai/groq";
import { geminiJSON } from "@/lib/ai/gemini";

type Profile = {
  name: string | null;
  trade: string;
  skills: string[];
  areas: string[];
  experience: number;
  visitRate: number;
};

const PROMPT = (t: string) => `You extract a tradesperson's profile from a spoken Urdu / Roman Urdu transcript.
Transcript: """${t}"""
Return ONLY JSON with this exact shape:
{"name": string|null, "trade": "electrician"|"plumber"|"ac"|"carpenter"|"mechanic",
 "skills": string[] (English, short), "areas": string[] (Islamabad/Rawalpindi sectors or neighbourhoods, e.g. "G-9"),
 "experience": number (years, 0 if not said), "visitRate": number (PKR, 0 if not said)}
Pick the closest trade. Do not invent facts that were not said.`;

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const audio = form.get("audio") as File | null;
    if (!audio) return NextResponse.json({ error: "NO_AUDIO" }, { status: 400 });

    const text = await transcribe(audio, audio.name || "audio.webm");
    if (!text) return NextResponse.json({ error: "EMPTY_TRANSCRIPT" }, { status: 422 });

    const profile = await geminiJSON<Profile>(PROMPT(text));
    return NextResponse.json({ transcript: text, profile });
  } catch (e) {
    // The frontend should switch to the tap-based onboarding on this error
    return NextResponse.json({ error: "AI_FAILED", detail: String(e) }, { status: 502 });
  }
}