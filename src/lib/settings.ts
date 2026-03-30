import { prisma } from "./prisma";

const defaults: Record<string, string> = {
  from_email: "HealthPulse <onboarding@resend.dev>",
  admin_emails: "me@nikitab.com",
};

export async function getSetting(key: string): Promise<string> {
  const setting = await prisma.setting.findUnique({ where: { key } });
  return setting?.value ?? defaults[key] ?? "";
}

export async function setSetting(key: string, value: string): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const settings = await prisma.setting.findMany();
  const result = { ...defaults };
  for (const s of settings) {
    result[s.key] = s.value;
  }
  return result;
}
