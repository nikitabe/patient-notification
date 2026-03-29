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
                <p className="text-xs text-gray-400 mt-0.5">
                  Condition: {adv.condition.name}
                </p>
              </div>
              <ImportanceBadge importance={adv.importance} />
            </div>
            <p className="text-sm text-gray-700">{adv.summary}</p>
            <div className="bg-blue-50 rounded-md p-3">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Why this matters: </span>
                {adv.explanation}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
