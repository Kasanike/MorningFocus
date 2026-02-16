import type { SupportedLocale } from "@/locales";

export interface StoicQuote {
  text: string;
  author: string;
}

/**
 * 20+ Stoic quotes from Marcus Aurelius, Seneca, and Epictetus.
 * One is picked per day based on a deterministic seed (date string).
 */
export const STOIC_QUOTES: StoicQuote[] = [
  {
    text: "You have power over your mind — not outside events. Realize this, and you will find strength.",
    author: "Marcus Aurelius",
  },
  {
    text: "The happiness of your life depends upon the quality of your thoughts.",
    author: "Marcus Aurelius",
  },
  {
    text: "Waste no more time arguing about what a good man should be. Be one.",
    author: "Marcus Aurelius",
  },
  {
    text: "Very little is needed to make a happy life; it is all within yourself, in your way of thinking.",
    author: "Marcus Aurelius",
  },
  {
    text: "Accept the things to which fate binds you, and love the people with whom fate brings you together.",
    author: "Marcus Aurelius",
  },
  {
    text: "The object of life is not to be on the side of the majority, but to escape finding oneself in the ranks of the insane.",
    author: "Marcus Aurelius",
  },
  {
    text: "How much more grievous are the consequences of anger than the causes of it.",
    author: "Marcus Aurelius",
  },
  {
    text: "Dwell on the beauty of life. Watch the stars, and see yourself running with them.",
    author: "Marcus Aurelius",
  },
  {
    text: "We suffer more often in imagination than in reality.",
    author: "Seneca",
  },
  {
    text: "It is not that we have a short time to live, but that we waste a lot of it.",
    author: "Seneca",
  },
  {
    text: "Luck is what happens when preparation meets opportunity.",
    author: "Seneca",
  },
  {
    text: "Difficulties strengthen the mind, as labor does the body.",
    author: "Seneca",
  },
  {
    text: "While we are postponing, life speeds by.",
    author: "Seneca",
  },
  {
    text: "We are more often frightened than hurt; and we suffer more from imagination than from reality.",
    author: "Seneca",
  },
  {
    text: "It is the power of the mind to be unconquerable.",
    author: "Seneca",
  },
  {
    text: "First say to yourself what you would be; and then do what you have to do.",
    author: "Epictetus",
  },
  {
    text: "We cannot choose our external circumstances, but we can always choose how we respond to them.",
    author: "Epictetus",
  },
  {
    text: "It's not what happens to you, but how you react to it that matters.",
    author: "Epictetus",
  },
  {
    text: "Only the educated are free.",
    author: "Epictetus",
  },
  {
    text: "No man is free who is not master of himself.",
    author: "Epictetus",
  },
  {
    text: "Make the best use of what is in your power, and take the rest as it happens.",
    author: "Epictetus",
  },
  {
    text: "Don't explain your philosophy. Embody it.",
    author: "Epictetus",
  },
  {
    text: "Wealth consists not in having great possessions, but in having few wants.",
    author: "Epictetus",
  },
];

/**
 * Slovak translations of the Stoic quotes. Same order as STOIC_QUOTES.
 */
export const STOIC_QUOTES_SK: StoicQuote[] = [
  { text: "Máš moc nad svojou mysľou — nie nad vonkajšími udalosťami. Uvedom si to a nájdeš silu.", author: "Marcus Aurelius" },
  { text: "Šťastie tvojho života závisí od kvality tvojich myšlienok.", author: "Marcus Aurelius" },
  { text: "Neplýtvaj viac časom hádaním sa o tom, aký má byť dobrý človek. Buď ním.", author: "Marcus Aurelius" },
  { text: "Na šťastný život stačí veľmi málo; všetko je v tebe samom, v tvojom spôsobe myslenia.", author: "Marcus Aurelius" },
  { text: "Prijmi veci, ktorými ťa osud viaže, a miluj ľudí, s ktorými ťa osud zjednocuje.", author: "Marcus Aurelius" },
  { text: "Účelom života nie je byť na strane väčšiny, ale vyhnúť sa tomu, aby si sa ocitol v radoch šialencov.", author: "Marcus Aurelius" },
  { text: "O koľko ťažšie sú následky hnevu než jeho príčiny.", author: "Marcus Aurelius" },
  { text: "Zamýšľaj sa nad krásou života. Sleduj hviezdy a predstav si seba, ako s nimi bežíš.", author: "Marcus Aurelius" },
  { text: "Trpíme častejšie v predstave ako v skutočnosti.", author: "Seneca" },
  { text: "Nie je to tak, že máme málo času na život, ale že ho veľa plytváme.", author: "Seneca" },
  { text: "Šťastie je to, čo sa stane, keď príprava stretne príležitosť.", author: "Seneca" },
  { text: "Ťažkosti posilňujú myseľ, ako práca telo.", author: "Seneca" },
  { text: "Kým odkladáme, život letí.", author: "Seneca" },
  { text: "Častejšie sa bojíme než trpíme; a trpíme viac od predstavy než od reality.", author: "Seneca" },
  { text: "Je to sila mysle byť neporaziteľná.", author: "Seneca" },
  { text: "Najprv si povedz, čím chceš byť; a potom urob, čo musíš.", author: "Epictetus" },
  { text: "Nemôžeme si vybrať vonkajšie okolnosti, ale vždy si môžeme vybrať, ako na ne zareagujeme.", author: "Epictetus" },
  { text: "Nie je dôležité, čo sa ti stane, ale ako na to zareaguješ.", author: "Epictetus" },
  { text: "Len vzdelaní sú slobodní.", author: "Epictetus" },
  { text: "Žiadny človek nie je slobodný, kto nie je pánom sám seba.", author: "Epictetus" },
  { text: "Najlepšie využi, čo je v tvojej moci, a zvyšok ber, ako príde.", author: "Epictetus" },
  { text: "Neobjasňuj svoju filozofiu. Ži ju.", author: "Epictetus" },
  { text: "Bohatstvo spočíva nie v tom mať veľký majetok, ale v tom mať málo potrieb.", author: "Epictetus" },
];

/**
 * Returns a deterministic "random" quote for the given date.
 * Same date = same quote each time. Uses locale for translation.
 */
export function getQuoteForDate(date: Date, locale: SupportedLocale = "en"): StoicQuote {
  const dateStr = date.toISOString().slice(0, 10); // YYYY-MM-DD
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  const quotes = locale === "sk" ? STOIC_QUOTES_SK : STOIC_QUOTES;
  const index = Math.abs(hash) % quotes.length;
  return quotes[index];
}
