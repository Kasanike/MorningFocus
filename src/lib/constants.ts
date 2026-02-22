export const STORAGE_KEYS = {
  PRINCIPLES: "morning-focus-principles",
  ACKNOWLEDGED_DATE: "morning-focus-acknowledged-date",
  KEYSTONE: "morning-focus-keystone",
  MORNING_PROTOCOL: "morning-focus-morning-protocol",
  MORNING_PROTOCOL_COMPLETED: "morning-focus-morning-protocol-completed",
  PROTOCOL_COMPLETION_TIME: "morning-focus-protocol-completion-time",
  LAST_VISIT_DATE: "morning-focus-date",
  LAST_ACTIVE_TAB: "morning-focus-last-active-tab",
  HAS_EDITED_CONTENT: "morning-focus-has-edited-content",
  TRIAL_BANNER_DISMISSED_DATE: "morning-focus-trial-banner-dismissed",
  ACTIVE_TAB_BY_DAY: "morning-focus-active-tab-by-day",
} as const;

export function getHasEditedContent(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEYS.HAS_EDITED_CONTENT) === "1";
}

export function setHasEditedContent(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.HAS_EDITED_CONTENT, "1");
}
