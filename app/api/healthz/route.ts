import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Database timeout")), 5000)
      ),
    ]);

    return NextResponse.json({
      ok: true,
      version: "1.0",
      database: "connected",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      {
        ok: false,
        version: "1.0",
        database: "disconnected",
        error: "Service unavailable",
      },
      { status: 503 }
    );
  }
}
