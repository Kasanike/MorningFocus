import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const ALLOWED_VOICES = ["onyx", "nova", "shimmer", "alloy", "echo", "fable"];

export async function POST(req: NextRequest) {
  const { text, voice = "onyx" } = await req.json();

  if (!text) return NextResponse.json({ error: "No text provided" }, { status: 400 });
  if (!ALLOWED_VOICES.includes(voice))
    return NextResponse.json({ error: "Invalid voice" }, { status: 400 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const hash = createHash("sha256").update(`${voice}:${text}`).digest("hex");
  const filePath = `${hash}.mp3`;

  // Try cache: download from storage (works even if bucket is private)
  const { data: cachedBlob, error: downloadError } = await supabase.storage
    .from("tts-cache")
    .download(filePath);

  if (!downloadError && cachedBlob) {
    const buffer = Buffer.from(await cachedBlob.arrayBuffer());
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": buffer.length.toString(),
      },
    });
  }

  // Cache miss: generate TTS
  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: voice as "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer",
    input: text,
  });

  const buffer = Buffer.from(await mp3.arrayBuffer());

  // Store in cache for next time (best-effort)
  await supabase.storage.from("tts-cache").upload(filePath, buffer, {
    contentType: "audio/mpeg",
    upsert: false,
  });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Length": buffer.length.toString(),
    },
  });
}
