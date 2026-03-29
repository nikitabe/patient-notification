import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import NotificationList from "@/components/NotificationList";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [conditionCount, notifications] = await Promise.all([
    prisma.condition.count({ where: { userId } }),
    prisma.notification.findMany({
      where: { userId },
      include: {
        advancements: {
          include: { condition: { select: { name: true } } },
        },
      },
      orderBy: { sentAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Your health advancement monitoring overview.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border p-5">
          <p className="text-sm text-gray-500">Tracked Conditions</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{conditionCount}</p>
          <Link
            href="/dashboard/conditions"
            className="text-sm text-blue-600 hover:underline mt-2 inline-block"
          >
            Manage conditions
          </Link>
        </div>
        <div className="bg-white rounded-lg border p-5">
          <p className="text-sm text-gray-500">Total Notifications</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{notifications.length}</p>
          <Link
            href="/dashboard/notifications"
            className="text-sm text-blue-600 hover:underline mt-2 inline-block"
          >
            View all
          </Link>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Recent Notifications
        </h2>
        <NotificationList notifications={notifications} />
      </div>
    </div>
  );
}
