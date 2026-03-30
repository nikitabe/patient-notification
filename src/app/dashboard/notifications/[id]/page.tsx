import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import ImportanceBadge from "@/components/ImportanceBadge";
import Link from "next/link";

export default async function NotificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  const notification = await prisma.notification.findFirst({
    where: { id, userId },
    include: {
      advancements: {
        include: { condition: { select: { name: true } } },
        orderBy: { discoveredAt: "desc" },
      },
    },
  });

  if (!notification) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/notifications"
          className="text-sm text-blue-600 hover:underline"
        >
          &larr; Back to notifications
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">
          {notification.subject}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Sent on {new Date(notification.sentAt).toLocaleDateString()}
        </p>
      </div>

      <div className="space-y-4">
        {notification.advancements.map((adv) => (
          <div key={adv.id} className="bg-white rounded-lg border p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{adv.title}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-gray-400">
                    Condition: {adv.condition.name}
                  </p>
                  {adv.dateOfAdvancement && (
                    <p className="text-xs text-gray-400">
                      | {adv.dateOfAdvancement}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {adv.actionable && (
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                    Actionable
                  </span>
                )}
                <ImportanceBadge importance={adv.importance} />
              </div>
            </div>
            <p className="text-sm text-gray-700">{adv.summary}</p>
            <div className="bg-blue-50 rounded-md p-3">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Why this matters: </span>
                {adv.explanation}
              </p>
            </div>
            {adv.actionable && adv.actionableDetails && (
              <div className="bg-purple-50 rounded-md p-3">
                <p className="text-sm text-purple-800">
                  <span className="font-medium">What you can do: </span>
                  {adv.actionableDetails}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
