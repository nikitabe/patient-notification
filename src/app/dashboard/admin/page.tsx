import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import AdminSettingsForm from "@/components/AdminSettingsForm";
import { getAllSettings } from "@/lib/settings";

export default async function AdminPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const email = user.emailAddresses[0]?.emailAddress;

  if (!(await isAdmin(email))) redirect("/dashboard");

  const settings = await getAllSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
        <p className="text-gray-500 mt-1">
          Configure system-wide settings for HealthPulse.
        </p>
      </div>

      <AdminSettingsForm settings={settings} />
    </div>
  );
}
