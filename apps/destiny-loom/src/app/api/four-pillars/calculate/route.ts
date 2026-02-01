import { NextRequest, NextResponse } from "next/server";
import { calculateFourPillars } from "@/lib/four-pillars";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { year, month, day, hour, gender } = body as {
      year: number;
      month: number;
      day: number;
      hour: number;
      gender?: string;
    };

    // Validate inputs
    if (!year || !month || !day || hour === undefined || hour === null) {
      return NextResponse.json(
        { error: "Required fields: year, month, day, hour" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(year) || year < 1 || year > 2200) {
      return NextResponse.json({ error: "Year must be an integer between 1 and 2200" }, { status: 400 });
    }
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      return NextResponse.json({ error: "Month must be 1-12" }, { status: 400 });
    }
    if (!Number.isInteger(day) || day < 1 || day > 31) {
      return NextResponse.json({ error: "Day must be 1-31" }, { status: 400 });
    }
    if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
      return NextResponse.json({ error: "Hour must be 0-23" }, { status: 400 });
    }
    if (gender && !["male", "female", "other"].includes(gender)) {
      return NextResponse.json({ error: "Gender must be male, female, or other" }, { status: 400 });
    }

    const pillars = calculateFourPillars(year, month, day, hour);

    return NextResponse.json({
      pillars,
      input: { year, month, day, hour, gender: gender || "other" },
      calculatedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error("Four Pillars calculation error:", error);
    return NextResponse.json({ error: "Failed to calculate Four Pillars" }, { status: 500 });
  }
}
