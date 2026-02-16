export const en = {
  // Header
  greeting: "Good Morning. Focus.",
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
  one_thing_title: "One Thing",
  one_thing_aria: "Priority of the day",
  one_thing_placeholder: "What is the one thing that would make today a success?",
  morning_protocol_title: "Morning Protocol",
  morning_protocol_aria: "Step by step morning actions",
  minutes: "min",
  total_minutes: "{{total}} min total",
  add_step: "Add step",
  protocol_step_placeholder: "Step name…",
  cancel: "Cancel",

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
