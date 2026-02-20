export function openNativeAlarm(time: string): void {
  const ua = navigator.userAgent.toLowerCase();
  const isAndroid = /android/.test(ua);
  const isIOS = /iphone|ipad/.test(ua);

  if (isAndroid) {
    const [hours, minutes] = time.split(":").map(Number);
    const message = encodeURIComponent("Better Morning");
    // Implicit intent — no package so Samsung Clock / any default alarm app handles it
    const intent =
      `intent://alarm/#Intent;` +
      `action=android.intent.action.SET_ALARM;` +
      `i.android.intent.extra.alarm.HOUR=${hours};` +
      `i.android.intent.extra.alarm.MINUTES=${minutes};` +
      `S.android.intent.extra.alarm.MESSAGE=${message};` +
      `S.android.intent.extra.alarm.SKIP_UI=false;` +
      `end`;
    window.location.href = intent;
  } else if (isIOS) {
    window.location.href = "clock-alarm://";
  } else {
    // Desktop — no redirect; caller should show feedback
  }
}

export function getDeepLinkSupport(): "android" | "ios" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  const ua = navigator.userAgent.toLowerCase();
  if (/android/.test(ua)) return "android";
  if (/iphone|ipad/.test(ua)) return "ios";
  return "desktop";
}
