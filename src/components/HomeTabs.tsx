"use client";

import { useState, useEffect } from "react";
import { Timer, BookOpen, Target, Flame } from "lucide-react";
import { MorningProtocol } from "@/components/MorningProtocol";
import { Keystone } from "@/components/Keystone";
import { ConstitutionList } from "@/components/ConstitutionList";
import { ProgressTab } from "@/components/ProgressTab";
import { STORAGE_KEYS } from "@/lib/constants";

type Tab = "protocol" | "constitution" | "keystone" | "progress";

const VALID_TABS: Tab[] = ["protocol", "constitution", "keystone", "progress"];

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
  { id: "progress", label: "Progress", Icon: Flame },
];

const GRAD = "linear-gradient(135deg, #a78bfa, #f472b6, #fb923c)";

function TabBar({
  activeTab,
  onSelect,
}: {
  activeTab: Tab;
  onSelect: (t: Tab) => void;
}) {
  return (
    <>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            className="flex flex-1 flex-col items-center gap-0.5 rounded-lg py-2 px-1.5 transition-all duration-200"
            style={isActive ? { background: GRAD, color: "white", boxShadow: "0 4px 20px rgba(167,139,250,0.3)" } : { color: "rgba(240,234,248,0.68)" }}
          >
            <tab.Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
            <span className="text-[10px] font-semibold tracking-wide uppercase">{tab.label}</span>
          </button>
        );
      })}
    </>
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
      {/* Tab nav — hidden on mobile, shown on sm+; hidden when guided mode is active */}
      {!guidedModeActive && (
        <div
          className="mb-3 hidden gap-0.5 rounded-xl p-0.5 sm:flex"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <TabBar activeTab={activeTab} onSelect={handleSelectTab} />
        </div>
      )}

      {/* Tab content */}
      <div className="pb-28 sm:pb-0">
        {activeTab === "protocol" && (
          <div key="protocol" className="animate-fade-in">
            <MorningProtocol
              onGoToConstitution={() => handleSelectTab("constitution")}
              onGuidedModeChange={setGuidedModeActive}
            />
          </div>
        )}

        {activeTab === "keystone" && (
          <div key="keystone" className="animate-fade-in space-y-6">
            <Keystone onGoToProgress={() => handleSelectTab("progress")} />
          </div>
        )}

        {activeTab === "constitution" && (
          <div key="constitution" className="animate-fade-in">
            <ConstitutionList onGoToKeystone={() => handleSelectTab("keystone")} />
          </div>
        )}

        {activeTab === "progress" && (
          <div key="progress" className="animate-fade-in">
            <ProgressTab />
          </div>
        )}
      </div>

      {/* Bottom nav — mobile only; hidden when guided mode (full-screen timer) is active */}
      {!guidedModeActive && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-50 flex gap-1 border-t px-4 pb-6 pt-2 sm:hidden"
          style={{
            background: "rgba(9,9,11,0.85)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          <TabBar activeTab={activeTab} onSelect={handleSelectTab} />
        </nav>
      )}
    </div>
  );
}
