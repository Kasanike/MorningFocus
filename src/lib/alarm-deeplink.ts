export function openNativeAlarm(time: string): void {
  const ua = navigator.userAgent.toLowerCase();
  const isAndroid = /android/.test(ua);

  if (isAndroid) {
    const [hours, minutes] = time.split(":").map(Number);
    window.location.href = `intent://alarm#Intent;S.hours=${hours};S.minutes=${minutes};S.message=Better Morning;S.skipUi=false;scheme=alarm;package=com.google.android.deskclock;end`;
  } else {
    // iOS — just open clock app, can't pre-fill time via web
    window.location.href = "clock://";
  }
}

export function getDeepLinkSupport(): "android" | "ios" | "desktop" {
  const ua = navigator.userAgent.toLowerCase();
  if (/android/.test(ua)) return "android";
  if (/iphone|ipad/.test(ua)) return "ios";
  return "desktop";
}
