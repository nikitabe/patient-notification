import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { discoverAdvancements } from "@/lib/llm";
import { sendAdvancementEmail } from "@/lib/email";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  // Verify cron secret in production
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get all distinct user IDs that have conditions
  const users = await prisma.condition.findMany({
    select: { userId: true },
    distinct: ["userId"],
  });

  const results: Array<{ userId: string; status: string; error?: string }> = [];

  for (const { userId } of users) {
    try {
      // Get user's conditions
      const conditions = await prisma.condition.findMany({
        where: { userId },
      });

      if (conditions.length === 0) continue;

      // Discover advancements for each condition
      const conditionAdvancements: Array<{
        conditionId: string;
        conditionName: string;
        advancements: Awaited<ReturnType<typeof discoverAdvancements>>;
      }> = [];

      for (const condition of conditions) {
        const advancements = await discoverAdvancements(
          condition.name,
          condition.notes
        );
        if (advancements.length > 0) {
          conditionAdvancements.push({
            conditionId: condition.id,
            conditionName: condition.name,
            advancements,
          });
        }
      }

      if (conditionAdvancements.length === 0) {
        results.push({ userId, status: "no_advancements" });
        continue;
      }

      // Create notification + advancements in a transaction
      const notification = await prisma.notification.create({
        data: {
          userId,
          subject: "New Health Advancements Found",
          advancements: {
            create: conditionAdvancements.flatMap(({ conditionId, advancements }) =>
              advancements.map((a) => ({
                conditionId,
                title: a.title,
                summary: a.summary,
                importance: a.importance,
                explanation: a.explanation,
                dateOfAdvancement: a.dateOfAdvancement || null,
                actionable: a.actionable ?? false,
                actionableDetails: a.actionableDetails || null,
              }))
            ),
          },
        },
      });

      // Get user email from Clerk and send notification
      try {
        const clerk = await clerkClient();
        const user = await clerk.users.getUser(userId);
        const email = user.emailAddresses[0]?.emailAddress;

        if (email) {
          await sendAdvancementEmail(email, conditionAdvancements);
        }
      } catch (emailError) {
        console.error(`Failed to send email for user ${userId}:`, emailError);
      }

      results.push({
        userId,
        status: "success",
      });
    } catch (error) {
      console.error(`Failed to process user ${userId}:`, error);
      results.push({
        userId,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return NextResponse.json({
    processed: results.length,
    results,
  });
}
