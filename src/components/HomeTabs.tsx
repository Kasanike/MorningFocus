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

const GRAD_ACTIVE = "linear-gradient(135deg, rgba(249,115,22,0.8), rgba(236,72,153,0.7))";

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
            style={isActive ? { background: GRAD_ACTIVE, color: "#fff" } : { color: "rgba(255,255,255,0.35)" }}
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
          className="mb-0 hidden gap-0.5 rounded-xl sm:flex"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "8px 8px 12px",
          }}
        >
          <TabBar activeTab={activeTab} onSelect={handleSelectTab} />
        </div>
      )}

      {/* Tab content */}
      <div className="pb-[90px] sm:pb-0">
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

      {/* Bottom nav — mobile only; hidden when guided mode (full-screen timer) is active */}
      {!guidedModeActive && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-50 flex w-full gap-0 sm:hidden"
          style={{
            width: "100%",
            maxWidth: 430,
            marginLeft: "auto",
            marginRight: "auto",
            paddingTop: 8,
            paddingLeft: 8,
            paddingRight: 8,
            paddingBottom: "max(12px, env(safe-area-inset-bottom))",
            background: "rgba(20,8,35,0.85)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            boxSizing: "border-box",
          }}
        >
          <TabBar activeTab={activeTab} onSelect={handleSelectTab} />
        </nav>
      )}
    </div>
  );
}
