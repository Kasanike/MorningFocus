export const en = {
  // Header
  greeting: "Morning Focus.",
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
  stoic_oracle_aria: "Daily Stoic quote",
  quote_title: "Quote",
  principles_title: "Personal Constitution",
  principles_subtitle: "The internal code that shapes my decisions.",
  principle_count: "{{count}} principle",
  principles_count: "{{count}} principles",
  one_thing_title: "One Thing",
  one_thing_prompt: "What is the one action that would create the biggest impact on my day?",
  one_thing_aria: "Priority of the day",
  one_thing_placeholder: "Your top priority for today…",
  morning_protocol_title: "Morning Protocol",
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
  add_principle_placeholder: "Add a new principle…",
  add_principle_subtitle_placeholder: "Subtitle (optional)…",
  edit_principle: "Edit",

  // Settings
  settings_title: "Settings",
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
