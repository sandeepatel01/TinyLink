import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { CreateLinkSchema } from "@/lib/validation";
import { generateRandomCode } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    const validationSchema = CreateLinkSchema.pick({
      url: true,
      customCode: true,
    });

    const validatedData = validationSchema.safeParse(payload);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          success: false,
          error: validatedData.error.errors[0]?.message || "Invalid input",
        },
        { status: 400 }
      );
    }

    const { url, customCode } = validatedData.data;

    // Generate code if not provided
    const code = customCode || generateRandomCode();

    // Check if custom code already exists
    if (customCode) {
      const existingLink = await prisma.link.findUnique({
        where: { code: customCode },
        select: { id: true },
      });

      if (existingLink) {
        return NextResponse.json(
          {
            success: false,
            error: "Custom code already exists. Please choose a different one.",
          },
          { status: 409 }
        );
      }
    }

    // Create the link in database
    const newLink = await prisma.link.create({
      data: {
        code,
        url,
        clicks: 0,
        lastClicked: null,
      },
      select: {
        id: true,
        code: true,
        url: true,
        clicks: true,
        lastClicked: true,
        createdAt: true,
      },
    });

    // Construct short URL
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.VERCEL_URL ||
      "http://localhost:3000";
    const shortUrl = `${baseUrl}/${newLink.code}`;

    return NextResponse.json(
      {
        success: true,
        data: {
          ...newLink,
          shortUrl,
        },
        message: "Link created successfully!",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create link API error:", error);

    // Handle Prisma unique constraint error
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          error: "This code is already taken. Please try a different one.",
        },
        { status: 409 }
      );
    }

    // Handle database connection errors
    if (error.name === "PrismaClientInitializationError") {
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed. Please try again later.",
        },
        { status: 503 }
      );
    }

    // Generic server error
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Please try again later.",
      },
      { status: 500 }
    );
  }
}

// GET all links
export async function GET(request: NextRequest) {
  try {
    const links = await prisma.link.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        code: true,
        url: true,
        clicks: true,
        lastClicked: true,
        createdAt: true,
      },
    });

    // Add shortUrl to each link
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.VERCEL_URL ||
      "http://localhost:3000";

    const linksWithShortUrl = links.map((link) => ({
      ...link,
      shortUrl: `${baseUrl}/${link.code}`,
    }));

    return NextResponse.json({
      success: true,
      data: linksWithShortUrl,
      count: links.length,
    });
  } catch (error: any) {
    console.error("Get links API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch links. Please try again later.",
      },
      { status: 500 }
    );
  }
}
