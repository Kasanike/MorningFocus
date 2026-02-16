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
  principles_title: "Personal Constitution",
  battle_plan_title: "The Battle Plan",
  battle_plan_aria: "Daily agenda",

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
