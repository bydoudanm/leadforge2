import { describe, expect, it } from "vitest";
import { filterOutreachItems } from "./outreachQueue";

describe("Outreach Queue filters", () => {
  const items = [
    { id: 1, searchMode: "individual" },
    { id: 2, searchMode: "company" },
    { id: 3, searchMode: "legacy" },
  ];

  it("shows all queued campaigns in All mode", () => {
    expect(filterOutreachItems(items, "all").map((item) => item.id)).toEqual([1, 2, 3]);
  });

  it("shows only company campaigns in Company mode", () => {
    expect(filterOutreachItems(items, "company").map((item) => item.id)).toEqual([2]);
  });

  it("treats non-company legacy rows as Individual campaigns", () => {
    expect(filterOutreachItems(items, "individual").map((item) => item.id)).toEqual([1, 3]);
  });
});
