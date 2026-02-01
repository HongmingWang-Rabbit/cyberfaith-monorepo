import { describe, it, expect } from "vitest";
import { cn, formatDate, generateId } from "../index";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("deduplicates tailwind conflicts", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});

describe("formatDate", () => {
  it("formats a Date object", () => {
    const result = formatDate(new Date(2025, 0, 15));
    expect(result).toBe("January 15, 2025");
  });

  it("formats a date string", () => {
    const result = formatDate(new Date(2025, 5, 1));
    expect(result).toBe("June 1, 2025");
  });
});

describe("generateId", () => {
  it("returns a valid UUID", () => {
    const id = generateId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
  });

  it("returns unique values", () => {
    const a = generateId();
    const b = generateId();
    expect(a).not.toBe(b);
  });
});
