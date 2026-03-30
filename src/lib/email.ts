import { Resend } from "resend";
import type { AdvancementResult } from "./llm";
import { getSetting } from "./settings";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

const importanceColor: Record<string, string> = {
  HIGH: "#dc2626",
  MEDIUM: "#d97706",
  LOW: "#16a34a",
};

export async function sendAdvancementEmail(
  to: string,
  conditionAdvancements: Array<{
    conditionName: string;
    advancements: AdvancementResult[];
  }>
) {
  const fromEmail = await getSetting("from_email");

  const advancementHtml = conditionAdvancements
    .map(
      ({ conditionName, advancements }) => `
      <h2 style="color:#1e40af;margin-top:24px;">${conditionName}</h2>
      ${advancements
        .map(
          (a) => `
        <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:12px 0;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <h3 style="margin:0;color:#111827;">${a.title}</h3>
            <span style="background:${importanceColor[a.importance] || "#6b7280"};color:white;padding:2px 10px;border-radius:12px;font-size:12px;font-weight:600;">
              ${a.importance}
            </span>
          </div>
          ${a.dateOfAdvancement ? `<p style="color:#9ca3af;font-size:12px;margin:4px 0 0;">${a.dateOfAdvancement}</p>` : ""}
          <p style="color:#4b5563;margin:8px 0;">${a.summary}</p>
          <div style="background:#eff6ff;border-radius:6px;padding:12px;margin-top:8px;">
            <p style="color:#1e40af;margin:0;font-size:14px;">
              <strong>Why this matters:</strong> ${a.explanation}
            </p>
          </div>
          ${a.actionable && a.actionableDetails ? `
          <div style="background:#faf5ff;border-radius:6px;padding:12px;margin-top:8px;">
            <p style="color:#7e22ce;margin:0;font-size:14px;">
              <strong>What you can do:</strong> ${a.actionableDetails}
            </p>
          </div>
          ` : ""}
        </div>
      `
        )
        .join("")}
    `
    )
    .join("");

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
      <h1 style="color:#111827;">New Health Advancements</h1>
      <p style="color:#6b7280;">We found new medical advancements relevant to your conditions.</p>
      ${advancementHtml}
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;" />
      <p style="color:#9ca3af;font-size:12px;">
        Sent by HealthPulse. You're receiving this because you have active health conditions being monitored.
      </p>
    </div>
  `;

  await getResend().emails.send({
    from: fromEmail,
    to,
    subject: "New Health Advancements Found",
    html,
  });
}
