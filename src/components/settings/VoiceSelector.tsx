"use client";

import { useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";

const VOICES = [
  { id: "onyx", label: "Onyx", desc: "Deep & authoritative" },
  { id: "nova", label: "Nova", desc: "Warm & friendly" },
  { id: "shimmer", label: "Shimmer", desc: "Soft & gentle" },
  { id: "alloy", label: "Alloy", desc: "Neutral & balanced" },
  { id: "echo", label: "Echo", desc: "Clear & confident" },
  { id: "fable", label: "Fable", desc: "Expressive & rich" },
];

const PREVIEW_TEXT = "Good morning. Today is your opportunity to grow.";

export default function VoiceSelector({ currentVoice }: { currentVoice: string }) {
  const supabase = createClient();
  const [selected, setSelected] = useState(currentVoice || "onyx");
  const [previewing, setPreviewing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const preview = async (voiceId: string) => {
    if (previewing === voiceId) {
      audioRef.current?.pause();
      setPreviewing(null);
      return;
    }

    audioRef.current?.pause();
    setPreviewing(voiceId);

    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: PREVIEW_TEXT, voice: voiceId }),
    });

    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onended = () => {
      URL.revokeObjectURL(url);
      setPreviewing(null);
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      setPreviewing(null);
    };
    audio.play();
  };

  const save = async () => {
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ tts_voice: selected }).eq("id", user.id);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-3">
      <p className="mb-4 text-sm text-white/50">
        Choose the voice that reads your constitution each morning.
      </p>

      {VOICES.map((voice) => (
        <div
          key={voice.id}
          onClick={() => setSelected(voice.id)}
          className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-all ${
            selected === voice.id
              ? "border-orange-400 bg-orange-400/10"
              : "border-white/10 bg-white/5 hover:bg-white/10"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                selected === voice.id ? "border-orange-400" : "border-white/30"
              }`}
            >
              {selected === voice.id && (
                <div className="h-2 w-2 rounded-full bg-orange-400" />
              )}
            </div>
            <div>
              <p className="font-medium text-white">{voice.label}</p>
              <p className="text-xs text-white/40">{voice.desc}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              preview(voice.id);
            }}
            className="rounded-full border border-orange-400/30 px-3 py-1 text-xs text-orange-400 transition-all hover:bg-orange-400/10"
          >
            {previewing === voice.id ? "⏹ Stop" : "▶ Preview"}
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="mt-4 w-full rounded-2xl bg-gradient-to-r from-orange-400 to-pink-500 py-3 font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Voice"}
      </button>
    </div>
  );
}
