// Límites de uso por plan. Ajusta estos números según cuánto quieras
// gastar en la API de Anthropic por usuario al día.
export const PLAN_LIMITS = {
  FREE: {
    messagesPerDay: 15,
    maxTokensPerReply: 900,
    memoryNotesLimit: 5,
    strategistPerDay: 2,
  },
  PRO: {
    messagesPerDay: 300,
    maxTokensPerReply: 1800,
    memoryNotesLimit: 200,
    strategistPerDay: 50,
  },
} as const;

export type PlanName = keyof typeof PLAN_LIMITS;

export function todayKey() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
}
