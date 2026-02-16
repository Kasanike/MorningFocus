/**
 * Agenda data structure.
 * Replace MOCK_AGENDA with real API data (e.g., Google Calendar) when ready.
 */

export interface AgendaItem {
  id: string;
  time: string; // e.g. "08:00"
  title: string;
  description?: string;
  completed?: boolean;
}

/**
 * Mock agenda for today.
 * TODO: Swap for API call to Google Calendar or similar.
 */
export function getAgendaForToday(): AgendaItem[] {
  // Use this function to fetch from API in the future:
  // const response = await fetch('/api/calendar?date=...');
  // return response.json();
  return MOCK_AGENDA;
}

export const MOCK_AGENDA: AgendaItem[] = [
  { id: "1", time: "06:30", title: "Wake", description: "No snooze." },
  { id: "2", time: "07:00", title: "Morning routine", description: "Cold shower, hydrate." },
  { id: "3", time: "08:00", title: "Deep Work", description: "2h focused block." },
  { id: "4", time: "10:00", title: "Break", description: "Move, stretch." },
  { id: "5", time: "10:30", title: "Meetings", description: "Clear the inbox." },
  { id: "6", time: "12:00", title: "Gym", description: "Strength training." },
  { id: "7", time: "13:30", title: "Lunch", description: "No screens." },
  { id: "8", time: "14:30", title: "Deep Work", description: "2h focused block." },
  { id: "9", time: "17:00", title: "Wind down", description: "Review tomorrow." },
];
