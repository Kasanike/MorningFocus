# Morning Focus

A modern, mobile-first web app to help you start your day with discipline, clarity, and purpose.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **State:** React Hooks + LocalStorage (no backend)
- **Deployment:** Vercel-ready with PWA support

## Features

- **Header:** Current date + disciplined greeting
- **Stoic Oracle:** Daily motivational quote (Marcus Aurelius, Seneca, Epictetus)
- **Personal Constitution:** Editable principles with morning acknowledgement checkboxes
- **Battle Plan:** Daily agenda timeline (mock data; ready for Google Calendar API)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## PWA Installation

The app includes a `manifest.json` for home screen installation. To add PWA icons:

1. Create 192×192 and 512×512 PNG icons.
2. Save them as `public/icon-192.png` and `public/icon-512.png`.
3. Or use a generator like [RealFaviconGenerator](https://realfavicongenerator.net/).

## Swapping Mock Agenda for Real Data

Edit `src/lib/agenda.ts` and replace `getAgendaForToday()` with your API call:

```ts
export async function getAgendaForToday(): Promise<AgendaItem[]> {
  const res = await fetch('/api/calendar?date=' + new Date().toISOString().slice(0,10));
  return res.json();
}
```

Then update `DailyAgenda` to fetch on the client or use a server component with the API.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── Header.tsx
│   ├── StoicQuote.tsx
│   ├── ConstitutionList.tsx
│   └── DailyAgenda.tsx
└── lib/
    ├── stoic-quotes.ts
    ├── constants.ts
    └── agenda.ts
```
