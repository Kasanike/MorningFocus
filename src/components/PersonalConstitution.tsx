"use client";

import { useState } from "react";
import { Cormorant_Garamond } from "next/font/google";
import { Check } from "lucide-react";

const cormorant = Cormorant_Garamond({
  weight: ["500", "600"],
  subsets: ["latin"],
});

interface PersonalConstitutionProps {
  principles: string[];
}

export function PersonalConstitution({ principles }: PersonalConstitutionProps) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const handleToggle = (index: number) => {
    setChecked((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <section
      className="rounded-lg border border-app-border bg-app-card px-8 py-12 sm:px-12 sm:py-16"
      aria-label="Osobná Ústava"
    >
      <header className="mb-10">
        <h2 className={`${cormorant.className} text-2xl font-semibold tracking-tight text-app-fg sm:text-3xl`}>
          Osobná Ústava
        </h2>
        <p className="mt-2 font-sans text-sm text-app-muted">
          Princípy, ktorými sa dnes riadim.
        </p>
      </header>

      <ul className="space-y-4" role="list">
        {principles.map((text, index) => (
          <li key={index}>
            <button
              type="button"
              onClick={() => handleToggle(index)}
              className="flex w-full cursor-pointer items-start gap-4 rounded-lg py-4 text-left transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-app-fg focus:ring-offset-2 focus:ring-offset-app-card"
              aria-pressed={checked[index]}
              aria-label={checked[index] ? `Odznačiť: ${text}` : `Značiť: ${text}`}
            >
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  checked[index]
                    ? "border-app-fg bg-app-fg"
                    : "border-app-muted bg-transparent"
                }`}
                aria-hidden
              >
                {checked[index] && (
                  <Check className="h-3.5 w-3.5 text-app-card" strokeWidth={2.5} />
                )}
              </span>
              <span
                className={`font-sans text-base leading-relaxed transition-opacity ${
                  checked[index] ? "text-app-fg opacity-50" : "text-app-fg opacity-100"
                }`}
              >
                {text}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
