/**
 * Morning Focus Alarm — Local Notifications (Capacitor)
 *
 * - Creates Android channel with importance 5 (max) and visibility 1 (public / lock screen).
 * - Uses custom sound from res/raw (e.g. alarm_sound.mp3).
 * - Schedule with allowWhileIdle for better delivery in Doze.
 *
 * Ensure AndroidManifest has permissions and full-screen intent config (see docs/android/AndroidManifest.snippets.xml).
 */

import { Capacitor } from "@capacitor/core";
import {
  LocalNotifications,
  type LocalNotificationSchema,
} from "@capacitor/local-notifications";

export const ALARM_CHANNEL_ID = "morning_focus_alarm";
export const ALARM_NOTIFICATION_ID = 1;

/** Call once at app init (e.g. in a root layout or provider). */
export async function ensureAlarmChannel(): Promise<void> {
  if (Capacitor.getPlatform() !== "android") return;

  await LocalNotifications.createChannel({
    id: ALARM_CHANNEL_ID,
    name: "Alarm",
    description: "Morning Focus wake-up alarm",
    importance: 5, // Max — wake device, heads-up, sound
    visibility: 1, // Public — show on lock screen
    sound: "alarm_sound", // res/raw/alarm_sound.mp3 (no extension in channel; use .mp3 or .wav in res/raw)
    vibration: true, // Channel property is 'vibration' in plugin
    lights: true,
    lightColor: "#09090b",
  });
}

/** Request notification permission (required on Android 13+). */
export async function requestNotificationPermission(): Promise<boolean> {
  const { display } = await LocalNotifications.requestPermissions();
  return display === "granted";
}

/** Schedule the next alarm at a given Date. Uses exact time; pass allowWhileIdle for Doze. */
export async function scheduleAlarmNotification(at: Date): Promise<void> {
  await ensureAlarmChannel();

  const notification: LocalNotificationSchema = {
    id: ALARM_NOTIFICATION_ID,
    title: "Morning Focus",
    body: "Slide to begin your day.",
    channelId: ALARM_CHANNEL_ID,
    schedule: {
      at,
      allowWhileIdle: true,
    },
    sound: "alarm_sound",
    autoCancel: false,
    ongoing: true,
  };

  await LocalNotifications.schedule({ notifications: [notification] });
}

/** Cancel the scheduled alarm. */
export async function cancelAlarmNotification(): Promise<void> {
  await LocalNotifications.cancel({
    notifications: [{ id: ALARM_NOTIFICATION_ID }],
  });
}

/** Check if we have permission to show notifications. */
export async function hasNotificationPermission(): Promise<boolean> {
  const { display } = await LocalNotifications.checkPermissions();
  return display === "granted";
}
