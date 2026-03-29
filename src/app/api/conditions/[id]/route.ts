import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const condition = await prisma.condition.findFirst({
    where: { id, userId },
  });

  if (!condition) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.condition.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
