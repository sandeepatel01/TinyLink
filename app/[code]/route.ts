import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;

    // Special case: healthz route
    if (code === "healthz") {
      return NextResponse.redirect(new URL("/api/healthz", request.url));
    }

    // Find link in database
    const link = await prisma.link.findUnique({
      where: { code },
    });

    if (!link) {
      // Return 404 with custom page (tum baad mein banoge)
      return NextResponse.redirect(new URL("/not-found", request.url));
    }

    // Update click count (async - don't wait for it)
    updateClickCount(code).catch(console.error);

    // Redirect to original URL
    return NextResponse.redirect(link.url, 302);
  } catch (error) {
    console.error("Redirect error:", error);
    // Fallback to not found
    return NextResponse.redirect(new URL("/not-found", request.url));
  }
}

// Async function to update click count
async function updateClickCount(code: string) {
  try {
    await prisma.link.update({
      where: { code },
      data: {
        clicks: { increment: 1 },
        lastClicked: new Date(),
      },
    });
  } catch (error) {
    console.error("Failed to update click count:", error);
  }
}
