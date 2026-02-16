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
 * Returns a deterministic "random" quote for the given date.
 * Same date = same quote each time.
 */
export function getQuoteForDate(date: Date): StoicQuote {
  const dateStr = date.toISOString().slice(0, 10); // YYYY-MM-DD
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  const index = Math.abs(hash) % STOIC_QUOTES.length;
  return STOIC_QUOTES[index];
}
