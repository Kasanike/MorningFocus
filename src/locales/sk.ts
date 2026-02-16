import type { LocaleKeys } from "./en";

export const sk: LocaleKeys = {
  // Header
  greeting: "Morning Focus.",
  weekdays: [
    "Nedeľa",
    "Pondelok",
    "Utorok",
    "Streda",
    "Štvrtok",
    "Piatok",
    "Sobota",
  ],
  months: [
    "Január",
    "Február",
    "Marec",
    "Apríl",
    "Máj",
    "Jún",
    "Júl",
    "August",
    "September",
    "Október",
    "November",
    "December",
  ],

  // Sections
  stoic_oracle_aria: "Denný stoický citát",
  quote_title: "Citát",
  principles_title: "Osobná ústava",
  principles_subtitle: "Prečítaj si všetky riadky a zaškrtni všetky políčka.",
  one_thing_title: "Jedna vec",
  one_thing_aria: "Priorita dňa",
  one_thing_placeholder: "Vaša priorita na dnes…",
  morning_protocol_title: "Ranný protokol",
  morning_protocol_aria: "Kroky ranných aktivít",
  minutes: "min",
  total_minutes: "{{total}} min celkom",
  add_step: "Pridať krok",
  protocol_step_placeholder: "Názov kroku…",
  cancel: "Zrušiť",

  // Default / seed data (shown when user has no stored data)
  default_principles: [
    "Som pokojný pod tlakom",
    "Dávam prednosť činom pred plánovaním",
    "Beriem zodpovednosť za svoje výsledky a neobviňujem iných",
    "Menej hovorím a viac počúvam",
    "Chránim si rána pre hĺbkovú prácu",
    "So svojím telom zaobchádzam ako s chrámom",
    "Som disciplínny v malých veciach, aby som bol disciplínny vo veľkých",
    "Sústreďujem sa na to, čo môžem ovplyvniť",
  ],
  default_protocol_step_labels: [
    "Vstávanie bez budíka",
    "Studená sprcha",
    "Hydratácia a rozcvička",
    "Mindfulness / denník",
    "Prezeranie priorít",
  ],

  // ConstitutionList
  loading: "Načítavam…",
  edit_principles: "Upraviť zásady",
  done_editing: "Hotovo",
  acknowledge: "Potvrdiť",
  save: "Uložiť",
  add: "Pridať",
  remove: "Odstrániť",
  add_principle_placeholder: "Pridať novú zásadu…",
  edit_principle: "Upraviť",

  // Settings
  settings_title: "Nastavenia",
  language_label: "Jazyk",
  language_english: "Angličtina",
  language_slovak: "Slovenčina",
  save_settings: "Uložiť",

  // Login
  login: "Prihlásiť sa",
  signup: "Registrovať sa",
  logout: "Odhlásiť sa",
};
