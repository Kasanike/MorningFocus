/**
 * Returns the intent/deep link URL for the current platform, or "" for desktop.
 */
export function getNativeAlarmUrl(time: string): string {
  if (typeof window === "undefined") return "";
  const ua = navigator.userAgent.toLowerCase();
  const isAndroid = /android/.test(ua);
  const isIOS = /iphone|ipad/.test(ua);

  if (isAndroid) {
    const [hours, minutes] = time.split(":").map(Number);
    const message = encodeURIComponent("Better Morning");
    return (
      `intent://alarm/#Intent;` +
      `action=android.intent.action.SET_ALARM;` +
      `i.android.intent.extra.alarm.HOUR=${hours};` +
      `i.android.intent.extra.alarm.MINUTES=${minutes};` +
      `S.android.intent.extra.alarm.MESSAGE=${message};` +
      `S.android.intent.extra.alarm.SKIP_UI=false;` +
      `end`
    );
  }
  if (isIOS) return "clock-alarm://";
  return "";
}

/**
 * Opens native alarm. On mobile, prefer using a link with getNativeAlarmUrl() so
 * the navigation is triggered by the same user gesture (required by some browsers).
 */
export function openNativeAlarm(time: string): void {
  const url = getNativeAlarmUrl(time);
  if (url) window.location.href = url;
}

export function getDeepLinkSupport(): "android" | "ios" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  const ua = navigator.userAgent.toLowerCase();
  if (/android/.test(ua)) return "android";
  if (/iphone|ipad/.test(ua)) return "ios";
  return "desktop";
}
