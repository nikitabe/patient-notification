import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ConditionForm from "@/components/ConditionForm";
import ConditionList from "@/components/ConditionList";

export default async function ConditionsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const conditions = await prisma.condition.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Health Conditions</h1>
        <p className="text-gray-500 mt-1">
          Add the health conditions you want to monitor for new advancements.
        </p>
      </div>

      <ConditionForm />

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Your Conditions ({conditions.length})
        </h2>
        <ConditionList conditions={conditions} />
      </div>
    </div>
  );
}
