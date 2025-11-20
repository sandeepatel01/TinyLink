import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;

  if (!code || code.length < 6 || code.length > 8) {
    return NextResponse.json(
      { success: false, error: "Invalid link code" },
      { status: 400 }
    );
  }

  const link = await prisma.link.findUnique({
    where: { code },
  });

  if (!link) {
    return NextResponse.json(
      { success: false, error: "Link not found" },
      { status: 404 }
    );
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_URL ||
    "http://localhost:3000";

  return NextResponse.json({
    success: true,
    data: {
      ...link,
      shortUrl: `${baseUrl}/${code}`,
    },
  });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;

  const existingLink = await prisma.link.findUnique({
    where: { code },
  });

  if (!existingLink) {
    return NextResponse.json(
      { success: false, error: "Link not found" },
      { status: 404 }
    );
  }

  await prisma.link.delete({ where: { code } });

  return NextResponse.json({
    success: true,
    message: "Link deleted successfully",
  });
}
