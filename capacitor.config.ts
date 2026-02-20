import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.morningfocus.alarm",
  appName: "Better Morning",
  webDir: "out",
  server: {
    // In dev, point to Next.js (optional)
    // url: "http://192.168.x.x:3000",
    // cleartext: true,
  },
  android: {
    allowMixedContent: true,
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#09090b",
      sound: "alarm_sound",
      channelId: "morning_focus_alarm",
      channelName: "Alarm",
      channelDescription: "Better Morning wake-up alarm",
      visibility: 1, // Public (show on lock screen)
      importance: 5, // Max — wake device, heads-up, sound
    },
  },
};

export default config;
