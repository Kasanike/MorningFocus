export function openNativeAlarm(time: string): void {
  const ua = navigator.userAgent.toLowerCase();
  const isAndroid = /android/.test(ua);
  const isIOS = /iphone|ipad/.test(ua);

  if (isAndroid) {
    const [hours, minutes] = time.split(":").map(Number);
    // Use standard Android alarm action — works across all clock apps
    window.location.href = `intent:#Intent;action=android.intent.action.SET_ALARM;S.android.intent.extra.alarm.HOUR=${hours};S.android.intent.extra.alarm.MINUTES=${minutes};S.android.intent.extra.alarm.MESSAGE=Better Morning;S.android.intent.extra.alarm.SKIP_UI=false;end`;
  } else if (isIOS) {
    window.location.href = "clock-alarm://";
  } else {
    // Desktop — do nothing, button shows instructions instead
  }
}

export function getDeepLinkSupport(): "android" | "ios" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  const ua = navigator.userAgent.toLowerCase();
  if (/android/.test(ua)) return "android";
  if (/iphone|ipad/.test(ua)) return "ios";
  return "desktop";
}
