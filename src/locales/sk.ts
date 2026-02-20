import type { LocaleKeys } from "./en";

export const sk: LocaleKeys = {
  // Header
  greeting: "Better Morning.",
  weekdays: [
    "Nedeľa",
    "Pondelok",
    "Utorok",
    "Streda",
    "Štvrtok",
    "Piatok",
    "Sobota",
  ],
  short_weekdays: ["Ne", "Po", "Ut", "St", "Št", "Pi", "So"],
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
  alarm_title: "Budík",
  alarm_aria: "Čas budíka a dni aktivity",
  alarm_time_label: "Čas",
  alarm_days_label: "Aktívny v",
  stoic_oracle_aria: "Denný stoický citát",
  quote_title: "Citát",
  principles_title: "Osobná ústava",
  principles_subtitle: "Vnútorný kód, ktorý formuje moje rozhodnutia.",
  principle_count: "{{count}} zásada",
  principles_count: "{{count}} zásad",
  one_thing_title: "Jedna vec",
  one_thing_prompt: "Aká jedna činnosť by mala na môj deň najväčší vplyv?",
  one_thing_aria: "Priorita dňa",
  one_thing_placeholder: "Vaša priorita na dnes…",
  morning_protocol_title: "Ranný protokol",
  morning_protocol_prompt: "Vstaň z postele a poď na to.",
  morning_protocol_aria: "Kroky ranných aktivít",
  minutes: "min",
  total_minutes: "{{total}} min celkom",
  add_step: "Pridať krok",
  protocol_step_placeholder: "Názov kroku…",
  cancel: "Zrušiť",

  // Default / seed data (shown when user has no stored data)
  default_principles: [
    {
      id: 1,
      text: "Som pokojný pod tlakom",
      subtitle:
        "Pokojnosť je moja kotva v chaos, umožňuje mi vidieť riešenia tam, kde iní vidia len problémy.",
    },
    {
      id: 2,
      text: "Dávam prednosť činom pred plánovaním",
      subtitle:
        "Jeden nedokonalý krok vpred má väčšiu hodnotu ako hodiny hľadania dokonalej cesty.",
    },
    {
      id: 3,
      text: "Beriem zodpovednosť za svoje výsledky a neobviňujem iných",
      subtitle:
        "Beriem plnú zodpovednosť za svoju realitu, lebo len tak získam skutočnú moc ju zmeniť.",
    },
    {
      id: 4,
      text: "Menej hovorím a viac počúvam",
      subtitle: "Slová používam striedmo, skutočné porozumenie a múdrosť prichádzajú v tichu.",
    },
    {
      id: 5,
      text: "Chránim si rána pre hĺbkovú prácu",
      subtitle:
        "Moja najvyššia mentálna energia patrí mojim najdôležitejším cieľom, nie požiadavkám vonkajšieho sveta.",
    },
    {
      id: 6,
      text: "So svojím telom zaobchádzam ako s chrámom",
      subtitle:
        "Fyzická sila a vitalita sú základom, na ktorom stoja moja mentálna jasnosť a výdrž.",
    },
    {
      id: 7,
      text: "Som disciplínny v malých veciach, aby som bol disciplínny vo veľkých",
      subtitle:
        "Spôsob, akým pristupujem k detailom, určuje kvalitu a charakter mojich najväčších úspechov.",
    },
    {
      id: 8,
      text: "Sústreďujem sa na to, čo môžem ovplyvniť",
      subtitle:
        "Svoju energiu investujem len tam, kde mám vplyv, ostatné nechávam plynúť bez zbytočnej starosti.",
    },
  ],
  default_protocol_step_labels: [
    "WC a ústna hygiena",
    "Hydratácia - pohár vody",
    "Rozcvička a ľahké cvičenie",
    "Mindfulness / dýchanie",
    "Prečítaj si svoju osobnú ústavu",
    "Naplánuj si deň / premýšľaj o svojej jednej veci",
    "Sprcha",
    "Zdravé raňajky / káva pri prerušovanom pôste",
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
  add_principle_subtitle_placeholder: "Podnadpis (voliteľné)…",
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
