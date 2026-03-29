import Link from "next/link";
import ImportanceBadge from "./ImportanceBadge";

interface Advancement {
  id: string;
  title: string;
  importance: string;
  condition: { name: string };
}

interface Notification {
  id: string;
  subject: string;
  sentAt: string | Date;
  advancements: Advancement[];
}

export default function NotificationList({ notifications }: { notifications: Notification[] }) {
  if (notifications.length === 0) {
    return (
      <p className="text-gray-500 text-sm">
        No notifications yet. They will appear here after the next advancement check.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => {
        const highestImportance = notification.advancements.find(
          (a) => a.importance === "HIGH"
        )
          ? "HIGH"
          : notification.advancements.find((a) => a.importance === "MEDIUM")
            ? "MEDIUM"
            : "LOW";

        return (
          <Link
            key={notification.id}
            href={`/dashboard/notifications/${notification.id}`}
            className="block bg-white rounded-lg border p-4 hover:border-blue-300 transition"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{notification.subject}</h4>
                <p className="text-sm text-gray-500 mt-1">
                  {notification.advancements.length} advancement
                  {notification.advancements.length !== 1 ? "s" : ""} found
                </p>
              </div>
              <div className="flex items-center gap-2">
                <ImportanceBadge importance={highestImportance} />
                <span className="text-xs text-gray-400">
                  {new Date(notification.sentAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
