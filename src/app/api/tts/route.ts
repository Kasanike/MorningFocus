import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  if (!text) return NextResponse.json({ error: "No text provided" }, { status: 400 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!supabaseUrl || !supabaseKey || !openaiKey) {
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const openai = new OpenAI({ apiKey: openaiKey });

  const hash = createHash("sha256").update(`shimmer:${text}`).digest("hex");
  const filePath = `${hash}.mp3`;

  // Cache: download from storage (works with private bucket)
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
    voice: "shimmer",
    input: text,
  });

  const buffer = Buffer.from(await mp3.arrayBuffer());

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
