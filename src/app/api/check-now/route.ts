import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { discoverAdvancements } from "@/lib/llm";
import { sendAdvancementEmail } from "@/lib/email";
import { NextResponse } from "next/server";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const conditions = await prisma.condition.findMany({
    where: { userId },
  });

  if (conditions.length === 0) {
    return NextResponse.json({
      status: "no_conditions",
      message: "You have no conditions to check. Add conditions first.",
    });
  }

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
    return NextResponse.json({
      status: "no_advancements",
      message: "No new relevant advancements were found for your conditions at this time.",
    });
  }

  // Persist notification + advancements
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
          }))
        ),
      },
    },
    include: {
      advancements: {
        include: { condition: { select: { name: true } } },
      },
    },
  });

  // Send email
  try {
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const email = user.emailAddresses[0]?.emailAddress;
    if (email) {
      await sendAdvancementEmail(email, conditionAdvancements);
    }
  } catch (emailError) {
    console.error("Failed to send email:", emailError);
  }

  return NextResponse.json({
    status: "success",
    notification,
  });
}
