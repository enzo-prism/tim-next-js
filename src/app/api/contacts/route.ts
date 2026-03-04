import { NextResponse } from "next/server";
import { z } from "zod";
import { insertContactSchema } from "@/server/schema";
import { storage } from "@/server/storage";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = insertContactSchema.parse(body);
    const contact = await storage.createContact(validatedData);

    return NextResponse.json({ success: true, contact }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid form data",
          errors: error.issues,
        },
        { status: 400 },
      );
    }

    console.error("Contact form error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit contact form",
      },
      { status: 500 },
    );
  }
}
