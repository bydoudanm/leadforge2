import { describe, expect, it } from "vitest";
import { filterLeads, hasAvailableData } from "./leadSearchFilters";

type TestLead = {
  opportunity: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  googleProfile?: string;
  website?: string;
};

describe("lead search result filters", () => {
  const leads: TestLead[] = [
    { opportunity: "Weak Website", email: "owner@example.com", phone: "123", whatsapp: "+1 123", googleProfile: "maps.example.com", website: "example.com" },
    { opportunity: "Weak Website", email: "second@example.com", phone: "456", website: "second.com" },
    { opportunity: "Weak SEO", email: "seo@example.com", phone: "789", website: "seo.com" },
  ];

  it("combines opportunity and availability filters with AND semantics", () => {
    expect(filterLeads(leads, "Weak Website", ["Email", "WhatsApp"])).toHaveLength(1);
    expect(filterLeads(leads, "Weak Website", ["Email"])).toHaveLength(2);
    expect(filterLeads(leads, "All", ["Website", "Phone"])).toHaveLength(3);
  });

  it("recognizes empty availability values as missing", () => {
    expect(hasAvailableData(leads[0], "Google Profile")).toBe(true);
    expect(hasAvailableData(leads[1], "Google Profile")).toBe(false);
    expect(hasAvailableData(leads[1], "WhatsApp")).toBe(false);
  });
});
