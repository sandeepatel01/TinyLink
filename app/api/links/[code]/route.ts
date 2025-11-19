import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: {
    code: string;
  };
}

// GET single link details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { code } = params;

    if (!code || code.length < 6 || code.length > 8) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid link code",
        },
        { status: 400 }
      );
    }

    const link = await prisma.link.findUnique({
      where: { code },
      select: {
        id: true,
        code: true,
        url: true,
        clicks: true,
        lastClicked: true,
        createdAt: true,
      },
    });

    if (!link) {
      return NextResponse.json(
        {
          success: false,
          error: "Link not found",
        },
        { status: 404 }
      );
    }

    // Add short URL
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.VERCEL_URL ||
      "http://localhost:3000";
    const shortUrl = `${baseUrl}/${link.code}`;

    return NextResponse.json({
      success: true,
      data: {
        ...link,
        shortUrl,
      },
    });
  } catch (error: unknown) {
    console.error("Get link API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch link details",
      },
      { status: 500 }
    );
  }
}

// DELETE link
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { code } = params;

    if (!code || code.length < 6 || code.length > 8) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid link code",
        },
        { status: 400 }
      );
    }

    // Check if link exists
    const existingLink = await prisma.link.findUnique({
      where: { code },
      select: { id: true },
    });

    if (!existingLink) {
      return NextResponse.json(
        {
          success: false,
          error: "Link not found",
        },
        { status: 404 }
      );
    }

    // Delete the link
    await prisma.link.delete({
      where: { code },
    });

    return NextResponse.json({
      success: true,
      message: "Link deleted successfully",
    });
  } catch (error: unknown) {
    console.error("Delete link API error:", error);

    // Check if error is a Prisma error with a code
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2025"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Link not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete link",
      },
      { status: 500 }
    );
  }
}
