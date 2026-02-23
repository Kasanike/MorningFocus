/** Day of year 1–365; pick quote by index (dayOfYear - 1) % 30. */
function getDayOfYear(): number {
  const d = new Date();
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
}

export const DAILY_REFLECTION_QUOTES: { text: string; author: string }[] = [
  { text: "The soul becomes dyed with the color of its thoughts.", author: "Marcus Aurelius" },
  { text: "Begin at once to live, and count each day as a separate life.", author: "Seneca" },
  { text: "We suffer more often in imagination than in reality.", author: "Seneca" },
  { text: "It is not that we have a short time to live, but that we waste a lot of it.", author: "Seneca" },
  { text: "Luck is what happens when preparation meets opportunity.", author: "Seneca" },
  { text: "You have power over your mind—not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius" },
  { text: "The best revenge is not to be like your enemy.", author: "Marcus Aurelius" },
  { text: "Waste no more time arguing what a good person should be. Be one.", author: "Marcus Aurelius" },
  { text: "First say to yourself what you would be; and then do what you have to do.", author: "Epictetus" },
  { text: "The happiness of your life depends upon the quality of your thoughts.", author: "Marcus Aurelius" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act but a habit.", author: "Aristotle" },
  { text: "How long are you going to wait before you demand the best for yourself?", author: "Epictetus" },
  { text: "Don't explain your philosophy. Embody it.", author: "Epictetus" },
  { text: "It's not what happens to you, but how you react to it that matters.", author: "Epictetus" },
  { text: "The mind is not a vessel to be filled but a fire to be kindled.", author: "Plutarch" },
  { text: "He who lives in harmony with himself lives in harmony with the universe.", author: "Marcus Aurelius" },
  { text: "Very little is needed to make a happy life.", author: "Marcus Aurelius" },
  { text: "Accept the things to which fate binds you, and love the people with whom fate brings you together.", author: "Marcus Aurelius" },
  { text: "Each day provides its own gifts.", author: "Marcus Aurelius" },
  { text: "Begin each day by telling yourself: Today I shall meet with interference, ingratitude, arrogance.", author: "Marcus Aurelius" },
  { text: "When you arise in the morning, think of what a precious privilege it is to be alive.", author: "Marcus Aurelius" },
  { text: "The object of life is not to be on the side of the majority, but to escape finding oneself in the ranks of the insane.", author: "Marcus Aurelius" },
  { text: "No person has the power to have everything they want, but it is in their power not to want what they don't have.", author: "Seneca" },
  { text: "We are more often frightened than hurt; and we suffer more from imagination than from reality.", author: "Seneca" },
  { text: "Life is very short and anxious for those who forget the past, neglect the present, and fear the future.", author: "Seneca" },
  { text: "While we are postponing, life speeds by.", author: "Seneca" },
  { text: "Difficulties strengthen the mind, as labor does the body.", author: "Seneca" },
  { text: "It is the power of the mind to be unconquerable.", author: "Seneca" },
  { text: "Only the educated are free.", author: "Epictetus" },
  { text: "Make the best use of what is in your power, and take the rest as it happens.", author: "Epictetus" },
];

export function getDailyReflectionQuote(): { text: string; author: string } {
  const dayOfYear = getDayOfYear();
  const index = (dayOfYear - 1) % DAILY_REFLECTION_QUOTES.length;
  return DAILY_REFLECTION_QUOTES[index];
}
