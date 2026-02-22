/**
 * Onboarding template presets by profession and age.
 * Returns constitution principles, protocol steps, and one Keystone example.
 * User can edit/delete all after onboarding — "We've suggested some starting points. Make them yours."
 */

export interface ConstitutionTemplate {
  title: string;
  description: string;
}

export interface ProtocolTemplate {
  title: string;
  duration: number;
}

export interface OnboardingTemplates {
  constitution: ConstitutionTemplate[];
  protocol: ProtocolTemplate[];
  keystoneExample: string;
}

type AgeRange = "18-24" | "25-34" | "35-44" | "45+";
type Profession =
  | "student"
  | "creative"
  | "developer"
  | "manager"
  | "educator"
  | "healthcare"
  | "entrepreneur"
  | "other";

const PRESETS: Record<string, OnboardingTemplates> = {
  student: {
    constitution: [
      { title: "Show up", description: "Attendance is the first win." },
      { title: "One chapter before scroll", description: "Read before you reach for the phone." },
      { title: "Sleep by 11", description: "Protect your rest." },
      { title: "Ask one question", description: "In class or in life — curiosity compounds." },
      { title: "Move daily", description: "Walk, run, or stretch — body and mind stay clear." },
      { title: "Finish one hard thing first", description: "Eat the frog before the easy wins." },
    ],
    protocol: [
      { title: "Wake & no phone", duration: 2 },
      { title: "Stretch or short walk", duration: 5 },
      { title: "Review today's priorities", duration: 5 },
      { title: "Deep work block", duration: 45 },
      { title: "Break", duration: 5 },
    ],
    keystoneExample: "Finish the problem set for Chapter 4",
  },

  "student_18-24": {
    constitution: [
      { title: "Show up", description: "Attendance is the first win." },
      { title: "One chapter before scroll", description: "Read before you reach for the phone." },
      { title: "Sleep by 11", description: "Protect your rest." },
      { title: "Ask one question", description: "In class or in life — curiosity compounds." },
      { title: "Move daily", description: "Walk, run, or stretch." },
      { title: "One hard thing first", description: "Eat the frog before the easy wins." },
    ],
    protocol: [
      { title: "Wake & no phone", duration: 2 },
      { title: "Quick stretch", duration: 5 },
      { title: "Review priorities", duration: 5 },
      { title: "Deep work", duration: 50 },
      { title: "Break", duration: 5 },
    ],
    keystoneExample: "Submit the essay draft",
  },

  creative: {
    constitution: [
      { title: "Create before consume", description: "Make something before you open feeds." },
      { title: "Ship imperfect", description: "Done beats perfect." },
      { title: "Protect the quiet hours", description: "Deep work needs blocks of focus." },
      { title: "Steal like an artist", description: "Collect inspiration; remix, don't copy." },
      { title: "Rest is part of the work", description: "Burnout kills creativity." },
      { title: "One project at a time", description: "Finish before you start the next." },
    ],
    protocol: [
      { title: "No screens, coffee/tea", duration: 5 },
      { title: "Journal or sketch", duration: 10 },
      { title: "Creative block", duration: 60 },
      { title: "Break & walk", duration: 10 },
      { title: "Admin or emails", duration: 20 },
    ],
    keystoneExample: "Ship the first draft of the piece",
  },

  developer: {
    constitution: [
      { title: "Code before meetings", description: "Peak focus for deep work first." },
      { title: "One deploy a day", description: "Small ships beat big launches." },
      { title: "Read before you write", description: "Docs and codebase before new code." },
      { title: "Tests are part of the feature", description: "No PR without coverage." },
      { title: "Step away when stuck", description: "Walks fix more bugs than staring." },
      { title: "Leave the code better", description: "Refactor one thing per task." },
    ],
    protocol: [
      { title: "No notifications", duration: 2 },
      { title: "Review PRs or tickets", duration: 15 },
      { title: "Deep coding block", duration: 60 },
      { title: "Break", duration: 5 },
      { title: "Second focus block", duration: 45 },
    ],
    keystoneExample: "Ship the auth fix to staging",
  },

  manager: {
    constitution: [
      { title: "People before tasks", description: "Check in before you check off." },
      { title: "One clear priority", description: "Your team should know the one thing." },
      { title: "Listen first", description: "Ask before you advise." },
      { title: "Decide or delegate", description: "Don't let decisions pile up." },
      { title: "Protect focus time", description: "Block calendar for deep work too." },
      { title: "End the day with clarity", description: "Tomorrow's top 3 before you leave." },
    ],
    protocol: [
      { title: "Quiet review", duration: 10 },
      { title: "Team standup or async check", duration: 15 },
      { title: "Deep work / strategy", duration: 45 },
      { title: "Break", duration: 5 },
      { title: "Meetings or 1:1s", duration: 60 },
    ],
    keystoneExample: "Send the Q2 goals draft to the team",
  },

  educator: {
    constitution: [
      { title: "Prepare before you perform", description: "The hour before class matters." },
      { title: "One student at a time", description: "Connection over coverage." },
      { title: "Learn in public", description: "Share what you're learning too." },
      { title: "Rest in the term", description: "Pace yourself; students need you steady." },
      { title: "Feedback is a gift", description: "Give it clearly; receive it openly." },
      { title: "Protect your reading time", description: "Stay sharp to teach sharp." },
    ],
    protocol: [
      { title: "Quiet coffee & plan", duration: 15 },
      { title: "Prep materials", duration: 30 },
      { title: "Teaching block", duration: 90 },
      { title: "Break", duration: 10 },
      { title: "Grading or admin", duration: 45 },
    ],
    keystoneExample: "Finalize the lesson plan for Unit 3",
  },

  healthcare: {
    constitution: [
      { title: "Rest to serve", description: "You can't pour from an empty cup." },
      { title: "One moment of presence", description: "Fully there for one patient at a time." },
      { title: "Boundaries are care", description: "Off hours are for you." },
      { title: "Document as you go", description: "Notes today save tomorrow." },
      { title: "Move between shifts", description: "Body and mind need the reset." },
      { title: "Ask for support", description: "Team and supervision are there." },
    ],
    protocol: [
      { title: "No phone, hydrate", duration: 5 },
      { title: "Review schedule & notes", duration: 15 },
      { title: "Clinical block", duration: 120 },
      { title: "Break", duration: 15 },
      { title: "Admin or follow-ups", duration: 30 },
    ],
    keystoneExample: "Complete the discharge summary for Room 4",
  },

  entrepreneur: {
    constitution: [
      { title: "Revenue before vanity", description: "Focus on what pays the bills." },
      { title: "One big bet per week", description: "Fewer initiatives, more follow-through." },
      { title: "Talk to customers", description: "At least one conversation a day." },
      { title: "Write it down", description: "Decisions and ideas in one place." },
      { title: "Rest is strategy", description: "Burnout kills the company." },
      { title: "Delegate or delete", description: "If it's not you, who is it?" },
    ],
    protocol: [
      { title: "No email first", duration: 5 },
      { title: "Top 3 for the day", duration: 10 },
      { title: "Deep work / build", duration: 60 },
      { title: "Break", duration: 5 },
      { title: "Calls or sales", duration: 45 },
    ],
    keystoneExample: "Close the partnership call with Acme",
  },

  "entrepreneur_35-44": {
    constitution: [
      { title: "Revenue before vanity", description: "Focus on what pays the bills." },
      { title: "One big bet per week", description: "Fewer initiatives, more follow-through." },
      { title: "Talk to customers", description: "At least one conversation a day." },
      { title: "Build the team", description: "Hire and develop; you can't do it all." },
      { title: "Rest is strategy", description: "Burnout kills the company." },
      { title: "Delegate or delete", description: "If it's not you, who is it?" },
    ],
    protocol: [
      { title: "No email first", duration: 5 },
      { title: "Top 3 for the day", duration: 10 },
      { title: "Deep work / strategy", duration: 60 },
      { title: "Break", duration: 5 },
      { title: "Team or partner calls", duration: 45 },
    ],
    keystoneExample: "Sign off the Q2 roadmap",
  },

  other: {
    constitution: [
      { title: "Start with the one thing", description: "One priority before the rest." },
      { title: "Move before noon", description: "Body and mind stay clear." },
      { title: "Less scroll, more create", description: "Make or do before you consume." },
      { title: "Sleep at a set time", description: "Rest is the base of everything." },
      { title: "One hard conversation", description: "Don't let it pile up." },
      { title: "End the day with tomorrow's one thing", description: "Wake up knowing the win." },
    ],
    protocol: [
      { title: "Quiet start, no phone", duration: 5 },
      { title: "Review and plan", duration: 10 },
      { title: "Focus block", duration: 45 },
      { title: "Break", duration: 5 },
      { title: "Second block or tasks", duration: 45 },
    ],
    keystoneExample: "Complete the most important task for today",
  },
};

const DEFAULT_TEMPLATE = PRESETS.other;

/** Message to show after applying templates: user can edit/delete everything. */
export const ONBOARDING_TEMPLATE_MESSAGE =
  "We've suggested some starting points. Make them yours.";

/**
 * Returns onboarding templates for the given age range and profession.
 * Uses profession-specific preset with optional age variant (e.g. student_18-24, entrepreneur_35-44).
 */
export function getTemplates(
  ageRange: string,
  profession: string
): OnboardingTemplates {
  const age = ageRange as AgeRange;
  const prof = profession as Profession;
  const variantKey = `${prof}_${age}`;
  if (PRESETS[variantKey]) return PRESETS[variantKey];
  if (PRESETS[prof]) return PRESETS[prof];
  return DEFAULT_TEMPLATE;
}
