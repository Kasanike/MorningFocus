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
  stoic_oracle_aria: "Daily Stoic quote",
  quote_title: "Quote",
  principles_title: "Personal Constitution",
  principles_subtitle: "Read for yourself all lines and check all boxes.",
  principle_count: "{{count}} principle",
  principles_count: "{{count}} principles",
  one_thing_title: "One Thing",
  one_thing_prompt: "What is the one action that would create the biggest impact on my day?",
  one_thing_aria: "Priority of the day",
  one_thing_placeholder: "Your top priority for today…",
  morning_protocol_title: "Morning Protocol",
  morning_protocol_prompt: "Get up from bed and do it.",
  morning_protocol_aria: "Step by step morning actions",
  minutes: "min",
  total_minutes: "{{total}} min total",
  add_step: "Add step",
  protocol_step_placeholder: "Step name…",
  cancel: "Cancel",

  // Default / seed data (shown when user has no stored data)
  default_principles: [
    "I am calm under pressure",
    "I prioritize execution over planning",
    "I own my outcomes and never blame others",
    "I speak less and listen more",
    "I protect my mornings for deep work",
    "I treat my body as a temple",
    "I am disciplined in small things to be disciplined in great ones",
    "I focus on what I can control",
  ],
  default_protocol_step_labels: [
    "Wake & no snooze",
    "Cold shower",
    "Hydrate & stretch",
    "Mindfulness / journaling",
    "Review priorities",
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

/** Shape of a locale - same keys as en, values are string or readonly string[] */
export type LocaleKeys = {
  [K in keyof typeof en]: (typeof en)[K] extends readonly string[]
    ? readonly string[]
    : string;
};
