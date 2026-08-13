import { describe, expect, it } from "vitest";
import {
  filterBusinessTypeResults,
  getBusinessTypeSuggestionSummary,
  getBusinessTypeSuggestions,
  matchesBusinessTypeQuery,
  normalizeBusinessTypeQuery,
} from "./businessTypeSearch";

describe("business type search", () => {
  it("suggests a plumbing business without requiring a fixed category selection", () => {
    const suggestions = getBusinessTypeSuggestions("plum");
    expect(suggestions[0]?.label).toBe("Plumber");
    expect(suggestions[0]?.semanticLabel).toBe("Plumber / Plumbing Companies");
  });

  it("supports broad custom business intents such as AI automation agencies", () => {
    const suggestions = getBusinessTypeSuggestions("ai automation agencies");
    expect(suggestions[0]?.label).toBe("AI Automation Agency");
    expect(getBusinessTypeSuggestionSummary(suggestions[0], "Los Angeles")).toBe("AI Automation Agencies in Los Angeles");
  });

  it("filters result sets by exact phrase and suggested semantic label", () => {
    const rows = [
      { category: "AI Automation Agency", company: "Northstar Automations" },
      { category: "Restaurant", company: "Napoli Pizza House" },
    ];
    const suggestedRows = filterBusinessTypeResults(rows, "AI Automation Agency", "suggested", (row) => `${row.category} ${row.company}`);
    const exactRows = filterBusinessTypeResults(rows, "restaurant", "exact", (row) => `${row.category} ${row.company}`);
    expect(suggestedRows).toHaveLength(1);
    expect(suggestedRows[0]?.company).toBe("Northstar Automations");
    expect(exactRows).toHaveLength(1);
    expect(exactRows[0]?.company).toBe("Napoli Pizza House");
  });

  it("keeps exact user text usable even when no suggestion exists", () => {
    expect(normalizeBusinessTypeQuery("  boutique drone repair  ")).toBe("boutique drone repair");
    expect(matchesBusinessTypeQuery("Boutique Drone Repair", "drone repair")).toBe(true);
    expect(getBusinessTypeSuggestions("boutique drone repair")).toHaveLength(0);
  });

  it("does not expose a generic Company option as a required business type", () => {
    expect(getBusinessTypeSuggestions("company").some((suggestion) => suggestion.label === "Company")).toBe(false);
  });
});
