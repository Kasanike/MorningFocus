import { en } from "./en";
import { sk } from "./sk";

export type SupportedLocale = "en" | "sk";

import type { LocaleKeys } from "./en";

export const translations: Record<SupportedLocale, LocaleKeys> = {
  en,
  sk,
};

export { en, sk };
