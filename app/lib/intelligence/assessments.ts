export const assessmentDefinitions = [
  {
    id: "values",
    title: "Values & identity",
    domain: "Personality & identity",
    questions: [
      "I can name the values behind my recent choices.",
      "My weekly commitments reflect what matters to me.",
      "I can explain a boundary I will protect.",
    ],
    next: "Choose one commitment this week that reflects a value you want to protect.",
  },
  {
    id: "thinking",
    title: "Thinking & decisions",
    domain: "Cognition",
    questions: [
      "I look for evidence that could change my mind.",
      "I compare alternatives before a consequential choice.",
      "I separate what I know from what I assume.",
    ],
    next: "For your next decision, write down one assumption and how you will check it.",
  },
  {
    id: "communication",
    title: "Communication & connection",
    domain: "Emotional & social",
    questions: [
      "I check that I understood someone before responding.",
      "I can explain a disagreement respectfully.",
      "I ask for clarification when expectations are unclear.",
    ],
    next: "In your next conversation, reflect back what you heard before offering your view.",
  },
  {
    id: "career",
    title: "Career & enterprise",
    domain: "Career & entrepreneurship",
    questions: [
      "I can name a skill people have paid me to use or asked my help with.",
      "I have checked whether my intended customers need my offer.",
      "I know the next practical step toward my professional goal.",
    ],
    next: "Ask one potential customer or collaborator about a problem you can help solve.",
  },
  {
    id: "money",
    title: "Money habits",
    domain: "Financial",
    questions: [
      "I know my essential monthly expenses.",
      "I check the full cost before a financial commitment.",
      "I have a plan for an unexpected expense.",
    ],
    next: "Write down essential expenses and one realistic step toward an emergency reserve.",
  },
  {
    id: "habits",
    title: "Habits & energy",
    domain: "Personal development",
    questions: [
      "I make commitments that fit my available energy.",
      "I return to a useful habit after an interruption.",
      "I notice when I need rest or support.",
    ],
    next: "Choose one small habit with a clear cue and a manageable first step.",
  },
] as const;
export type AssessmentId = (typeof assessmentDefinitions)[number]["id"];
export const assessmentVersion = 1;
export const assessmentDisclaimer =
  "A short self-reflection, not a validated psychological test, clinical screening, diagnosis, or prediction. Your answers describe your current self-report and may change with context.";
export function scoreAssessment(id: string, answers: number[]) {
  const definition = assessmentDefinitions.find((item) => item.id === id);
  if (
    !definition ||
    answers.length !== definition.questions.length ||
    answers.some((value) => !Number.isInteger(value) || value < 1 || value > 5)
  )
    throw new Error("Answer every question using a number from 1 to 5.");
  const total = answers.reduce((sum, value) => sum + value, 0);
  return {
    total,
    maximum: 15,
    version: assessmentVersion,
    interpretation:
      total >= 12
        ? "You currently report practicing these behaviors often. Look for a real example that supports or challenges this pattern."
        : total >= 8
        ? "Your answers describe a mixed pattern. Notice which behavior is easiest and which needs support."
        : "You currently report these behaviors less often. Choose one manageable change rather than treating this as a fixed trait.",
    next: definition.next,
    disclaimer: assessmentDisclaimer,
  };
}
