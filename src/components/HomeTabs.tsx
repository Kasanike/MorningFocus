"use client";

import { useState, useEffect } from "react";
import { Timer, BookOpen, Target, Moon } from "lucide-react";
import { MorningProtocol } from "@/components/MorningProtocol";
import { Keystone } from "@/components/Keystone";
import { ConstitutionList } from "@/components/ConstitutionList";
import { ReflectTab } from "@/components/ReflectTab";
import { STORAGE_KEYS } from "@/lib/constants";

type Tab = "protocol" | "constitution" | "keystone" | "reflect";

const VALID_TABS: Tab[] = ["protocol", "constitution", "keystone", "reflect"];

function getDefaultTab(): Tab {
  if (typeof window === "undefined") return "protocol";
  const lastVisit = localStorage.getItem(STORAGE_KEYS.LAST_VISIT_DATE);
  const today = new Date().toDateString();
  if (lastVisit !== today) {
    localStorage.setItem(STORAGE_KEYS.LAST_VISIT_DATE, today);
    return "protocol";
  }
  const saved = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVE_TAB);
  if (saved && VALID_TABS.includes(saved as Tab)) return saved as Tab;
  return "protocol";
}

function persistTab(tab: Tab): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_ACTIVE_TAB, tab);
  } catch {
    // ignore
  }
}

const TABS: { id: Tab; label: string; Icon: typeof Timer }[] = [
  { id: "protocol", label: "Protocol", Icon: Timer },
  { id: "constitution", label: "Constitution", Icon: BookOpen },
  { id: "keystone", label: "Keystone", Icon: Target },
  { id: "reflect", label: "Reflect", Icon: Moon },
];

function BottomNav({
  activeTab,
  onSelect,
  hidden,
}: {
  activeTab: Tab;
  onSelect: (t: Tab) => void;
  hidden: boolean;
}) {
  if (hidden) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex h-14 items-center justify-around border-t border-zinc-800 bg-zinc-950/80 backdrop-blur-md sm:bottom-0"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0)",
      }}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelect(tab.id)}
            aria-label={tab.label}
            className={`flex min-w-0 flex-1 items-center justify-center transition-colors duration-200 ${
              isActive ? "text-orange-500" : "text-zinc-500"
            }`}
          >
            <tab.Icon
              className="h-6 w-6 shrink-0"
              strokeWidth={isActive ? 2.5 : 1.5}
              aria-hidden
            />
          </button>
        );
      })}
    </nav>
  );
}

export function HomeTabs() {
  const [activeTab, setActiveTab] = useState<Tab>("protocol");
  const [guidedModeActive, setGuidedModeActive] = useState(false);

  useEffect(() => {
    setActiveTab(getDefaultTab());
  }, []);

  const handleSelectTab = (tab: Tab) => {
    setActiveTab(tab);
    persistTab(tab);
  };

  return (
    <div>
      <div className="pb-20 sm:pb-0">
        {activeTab === "protocol" && (
          <div key="protocol" className="animate-fade-in">
            <MorningProtocol
              onGoToConstitution={() => handleSelectTab("constitution")}
              onGuidedModeChange={setGuidedModeActive}
            />
          </div>
        )}

        {activeTab === "keystone" && (
          <div key="keystone" className="animate-fade-in space-y-4">
            <Keystone />
          </div>
        )}

        {activeTab === "constitution" && (
          <div key="constitution" className="animate-fade-in">
            <ConstitutionList onGoToKeystone={() => handleSelectTab("keystone")} />
          </div>
        )}

        {activeTab === "reflect" && (
          <div key="reflect" className="animate-fade-in">
            <ReflectTab />
          </div>
        )}
      </div>

      <BottomNav
        activeTab={activeTab}
        onSelect={handleSelectTab}
        hidden={guidedModeActive}
      />
    </div>
  );
}
