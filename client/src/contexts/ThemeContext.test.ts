import { describe, expect, it } from "vitest";
import { resolveTheme } from "./ThemeContext";

describe("theme resolution", () => {
  it("accepts the persisted White theme", () => {
    expect(resolveTheme("white")).toBe("white");
  });

  it("accepts the persisted Dark theme", () => {
    expect(resolveTheme("dark", "white")).toBe("dark");
  });

  it("falls back to the configured default for unknown values", () => {
    expect(resolveTheme("sepia", "white")).toBe("white");
    expect(resolveTheme(null, "dark")).toBe("dark");
  });
});
