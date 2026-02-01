import { NextRequest, NextResponse } from "next/server";
import { calculateFourPillars } from "@/lib/four-pillars";
import { errorResponse, withRateLimitHeaders, parseBody } from "@/lib/api-utils";

const VALID_GENDERS = new Set(["male", "female", "other"]);

export async function POST(request: NextRequest) {
  try {
    const { data: body, error } = await parseBody(request, 5_000);
    if (error) return withRateLimitHeaders(error);

    const { year, month, day, hour, gender } = body as {
      year: number;
      month: number;
      day: number;
      hour: number;
      gender?: string;
    };

    if (!year || !month || !day || hour === undefined || hour === null) {
      return withRateLimitHeaders(errorResponse("Missing required fields", 400, "Required fields: year, month, day, hour"));
    }

    if (!Number.isInteger(year) || year < 1 || year > 2200) {
      return withRateLimitHeaders(errorResponse("Invalid year", 400, "Year must be an integer between 1 and 2200"));
    }
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      return withRateLimitHeaders(errorResponse("Invalid month", 400, "Month must be 1-12"));
    }
    if (!Number.isInteger(day) || day < 1 || day > 31) {
      return withRateLimitHeaders(errorResponse("Invalid day", 400, "Day must be 1-31"));
    }
    if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
      return withRateLimitHeaders(errorResponse("Invalid hour", 400, "Hour must be 0-23"));
    }
    if (gender && !VALID_GENDERS.has(gender)) {
      return withRateLimitHeaders(errorResponse("Invalid gender", 400, "Gender must be male, female, or other"));
    }

    const pillars = calculateFourPillars(year, month, day, hour);

    return withRateLimitHeaders(NextResponse.json({
      pillars,
      input: { year, month, day, hour, gender: gender || "other" },
      calculatedAt: new Date().toISOString(),
    }));
  } catch (error: unknown) {
    console.error("Four Pillars calculation error:", error);
    return withRateLimitHeaders(errorResponse("Failed to calculate Four Pillars", 500));
  }
}
