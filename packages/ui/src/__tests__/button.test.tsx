import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Button } from "../components/button";

afterEach(cleanup);

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeDefined();
  });

  it("applies custom className", () => {
    render(<Button className="custom">Test</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("custom");
  });

  it("forwards disabled prop", () => {
    render(<Button disabled>Test</Button>);
    const btn = screen.getByRole("button");
    expect(btn.hasAttribute("disabled")).toBe(true);
  });
});
