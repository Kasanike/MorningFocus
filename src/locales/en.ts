export const en = {
  // Header
  greeting: "Better Morning.",
  streak_start: "Start your streak",
  streak_restart_hint: "Complete today to restart",
  weekdays: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],
  short_weekdays: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
  months: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],

  // Sections
  alarm_title: "Alarm",
  alarm_aria: "Alarm time and active days",
  alarm_time_label: "Time",
  alarm_days_label: "Active on",
  stoic_oracle_aria: "Remember this today — contextual to your commitment",
  quote_remember_today: "Remember this today.",
  quote_title: "Quote",
  principles_title: "Personal Constitution",
  principles_subtitle: "The internal code that shapes my decisions.",
  principle_count: "{{count}} principle",
  principles_count: "{{count}} principles",
  constitution_listen: "Listen",
  constitution_start_listening: "Start Listening",
  constitution_listened: "Listened",
  constitution_audio_unsupported: "Audio not supported on this browser",
  constitution_audio_load_failed: "Could not load audio. Try again.",
  constitution_playback_tap_again: "Tap Listen again to start playback.",
  constitution_listen_progress: "{{current}} of {{total}}",
  keystone_title: "Keystone",
  keystone_prompt: "What is the one action that would create the biggest impact on my day?",
  keystone_aria: "Priority of the day",
  keystone_placeholder: "Your top priority for today…",
  keystone_lock_button: "Lock it in.",
  keystone_todays_commitment: "Today's commitment",
  keystone_locked_badge: "✓ Locked in",
  keystone_edit: "Edit",
  keystone_see_all: "See all →",
  keystone_recent_title: "Recent keystones",
  progress_title: "Progress",
  progress_subtitle: "Your streak and activity.",
  morning_protocol_title: "Morning Protocol",
  morning_protocol_subtitle: "The foundation everything else is built on.",
  morning_protocol_prompt: "Get out of bed and go for it.",
  morning_protocol_aria: "Step by step morning actions",
  minutes: "min",
  total_minutes: "{{total}} min total",
  add_step: "Add step",
  protocol_step_placeholder: "Step name…",
  cancel: "Cancel",

  // Default / seed data (shown when user has no stored data)
  default_principles: [
    {
      id: 1,
      text: "I am calm under pressure",
      subtitle:
        "Composure is my anchor in chaos, allowing me to see solutions where others only see problems.",
    },
    {
      id: 2,
      text: "I prioritize execution over planning",
      subtitle:
        "One imperfect step forward is worth more than hours spent searching for the perfect path.",
    },
    {
      id: 3,
      text: "I own my outcomes and never blame others",
      subtitle:
        "I accept full responsibility for my reality, for only then do I gain the true power to change it.",
    },
    {
      id: 4,
      text: "I speak less and listen more",
      subtitle: "I use words sparingly, for true understanding and wisdom arrive in silence.",
    },
    {
      id: 5,
      text: "I protect my mornings for deep work",
      subtitle:
        "My highest mental energy belongs to my most critical goals, not the demands of the outside world.",
    },
    {
      id: 6,
      text: "I treat my body as a temple",
      subtitle:
        "Physical strength and vitality are the foundation upon which my mental clarity and endurance stand.",
    },
    {
      id: 7,
      text: "I am disciplined in small things to be disciplined in great ones",
      subtitle:
        "The way I approach details defines the quality and character of my greatest achievements.",
    },
    {
      id: 8,
      text: "I focus on what I can control",
      subtitle:
        "I invest my energy only where I have influence, letting the rest flow without unnecessary worry.",
    },
  ],
  default_protocol_step_labels: [
    "WC and Oral Hygiene",
    "Hydrate - cup of water",
    "Stretch & Light Exercise",
    "Mindfulness / breathing",
    "Read your personal constitution",
    "Plan your day / think of your One thing",
    "Shower",
    "Healthy breakfast / Intermittent fasting coffee",
  ],

  // ConstitutionList
  loading: "Loading…",
  edit_principles: "Edit principles",
  done_editing: "Done editing",
  acknowledge: "Acknowledge",
  save: "Save",
  add: "Add",
  remove: "Remove",
  add_principle: "Add principle",
  add_principle_placeholder: "Add a new principle…",
  add_principle_subtitle_placeholder: "Subtitle (optional)…",
  edit_principle: "Edit",

  // Settings
  settings_title: "Settings",
  account_label: "Account",
  signed_in_as: "Signed in as",
  sign_out: "Sign out",
  sign_in: "Sign in",
  language_label: "Language",
  language_english: "English",
  language_slovak: "Slovak",
  save_settings: "Save",

  // Login (for future use)
  login: "Log in",
  signup: "Sign up",
  logout: "Log out",
} as const;

/** Shape of a locale - keys must match en, values allow localized strings/arrays */
export type LocaleKeys = {
  [K in keyof typeof en]: (typeof en)[K] extends string
    ? string
    : (typeof en)[K] extends readonly (infer E)[]
      ? E extends { id: number; text: string; subtitle: string }
        ? readonly { id: number; text: string; subtitle: string }[]
        : readonly string[]
      : (typeof en)[K];
};
