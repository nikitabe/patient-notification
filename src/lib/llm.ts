import Anthropic from "@anthropic-ai/sdk";

export interface AdvancementResult {
  title: string;
  summary: string;
  importance: "HIGH" | "MEDIUM" | "LOW";
  explanation: string;
  dateOfAdvancement: string | null;
  actionable: boolean;
  actionableDetails: string | null;
}

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

export async function discoverAdvancements(
  conditionName: string,
  userNotes: string | null
): Promise<AdvancementResult[]> {
  const message = await getClient().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `You are a medical research analyst. Identify 3-5 recent noteworthy advancements, treatments, clinical trials, or research breakthroughs relevant to the following health condition.

Condition: ${conditionName}
${userNotes ? `Additional context from the patient: ${userNotes}` : ""}

For each advancement:
1. title: A clear, concise title
2. summary: 2-3 sentence summary accessible to a non-medical audience
3. importance: Rate as HIGH, MEDIUM, or LOW based on potential impact on patient care
4. explanation: 1-2 sentences explaining why this matters specifically for someone with this condition
5. dateOfAdvancement: The approximate date this advancement was published or announced (e.g. "March 2025", "Q1 2025", "2024"). Use null if unknown.
6. actionable: true if this is something the patient can act on now (e.g. ask their doctor about a newly approved treatment, enroll in a trial), false if it's early-stage research or not yet available
7. actionableDetails: If actionable is true, a brief explanation of what the patient can do (e.g. "Ask your doctor about this FDA-approved treatment"). Use null if not actionable.

Return ONLY a JSON array with no other text. Example format:
[{"title": "...", "summary": "...", "importance": "HIGH", "explanation": "...", "dateOfAdvancement": "March 2025", "actionable": true, "actionableDetails": "Ask your doctor about..."}]`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];

  try {
    const results = JSON.parse(jsonMatch[0]) as AdvancementResult[];
    return results.filter(
      (r) => r.title && r.summary && r.importance && r.explanation
    );
  } catch {
    return [];
  }
}
