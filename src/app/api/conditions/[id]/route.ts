import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
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

  const body = await request.json();
  const { name, notes } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Condition name is required" }, { status: 400 });
  }

  const updated = await prisma.condition.update({
    where: { id },
    data: {
      name: name.trim(),
      notes: notes?.trim() || null,
    },
  });

  return NextResponse.json(updated);
}

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
