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

  it("handles undefined and null inputs", () => {
    expect(cn("foo", undefined, "bar")).toBe("foo bar");
    expect(cn("foo", null, "bar")).toBe("foo bar");
  });

  it("handles empty string inputs", () => {
    expect(cn("", "foo", "")).toBe("foo");
  });

  it("handles no arguments", () => {
    expect(cn()).toBe("");
  });

  it("resolves multiple tailwind conflicts", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
    expect(cn("p-2", "p-4", "p-8")).toBe("p-8");
  });

  it("handles array inputs", () => {
    expect(cn(["foo", "bar"])).toBe("foo bar");
  });

  it("handles object inputs", () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe("foo baz");
  });

  it("handles mixed complex inputs", () => {
    expect(cn("base", ["arr1", "arr2"], { cond: true })).toBe("base arr1 arr2 cond");
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

  it("formats ISO string input", () => {
    const result = formatDate("2023-12-25T00:00:00.000Z");
    expect(result).toContain("2023");
    expect(result).toContain("December");
  });

  it("formats date at year boundary", () => {
    const result = formatDate(new Date(2000, 0, 1));
    expect(result).toBe("January 1, 2000");
  });

  it("formats leap day", () => {
    const result = formatDate(new Date(2024, 1, 29));
    expect(result).toBe("February 29, 2024");
  });

  it("throws on invalid date string", () => {
    expect(() => formatDate("not-a-date")).toThrow();
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

  it("returns unique values across many calls", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });

  it("returns string of correct length", () => {
    const id = generateId();
    expect(id.length).toBe(36); // UUID v4 format: 8-4-4-4-12
  });
});
