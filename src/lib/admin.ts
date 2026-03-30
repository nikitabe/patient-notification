import { prisma } from "./prisma";

const DEFAULT_ADMIN_EMAILS = "me@nikitab.com";

export async function isAdmin(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;

  const setting = await prisma.setting.findUnique({ where: { key: "admin_emails" } });
  const adminList = (setting?.value || DEFAULT_ADMIN_EMAILS)
    .split(",")
    .map((e) => e.trim().toLowerCase());

  return adminList.includes(email.toLowerCase());
}
