import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import NotificationList from "@/components/NotificationList";

export default async function NotificationsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const notifications = await prisma.notification.findMany({
    where: { userId },
    include: {
      advancements: {
        include: { condition: { select: { name: true } } },
      },
    },
    orderBy: { sentAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-500 mt-1">
          Past advancement notifications sent to your email.
        </p>
      </div>

      <NotificationList notifications={notifications} />
    </div>
  );
}
