import { auth, clerkClient } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { isAdmin } from "@/lib/admin";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/conditions", label: "Conditions" },
  { href: "/dashboard/notifications", label: "Notifications" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let showAdmin = false;
  try {
    const { userId } = await auth();
    if (userId) {
      const clerk = await clerkClient();
      const user = await clerk.users.getUser(userId);
      const email = user.emailAddresses[0]?.emailAddress;
      showAdmin = isAdmin(email);
    }
  } catch {
    // ignore - just don't show admin link
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="font-bold text-lg text-blue-600">
              HealthPulse
            </Link>
            <nav className="flex gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-gray-600 hover:text-gray-900 transition"
                >
                  {item.label}
                </Link>
              ))}
              {showAdmin && (
                <Link
                  href="/dashboard/admin"
                  className="text-sm text-purple-600 hover:text-purple-900 transition"
                >
                  Admin
                </Link>
              )}
            </nav>
          </div>
          <UserButton />
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
