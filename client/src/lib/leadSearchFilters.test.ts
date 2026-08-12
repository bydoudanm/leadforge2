import { describe, expect, it } from "vitest";
import { filterLeads, hasAvailableData } from "./leadSearchFilters";

type TestLead = {
  opportunity: string;
  email?: string;
  ownerEmail?: string;
  founderEmail?: string;
  phone?: string;
  whatsapp?: string;
  facebookPage?: string;
  instagram?: string;
  linkedinProfile?: string;
  googleProfile?: string;
  website?: string;
};

describe("lead search result filters", () => {
  const leads: TestLead[] = [
    { opportunity: "Weak Website", email: "owner@example.com", ownerEmail: "owner@company.example", founderEmail: "founder@company.example", phone: "123", whatsapp: "+1 123", facebookPage: "facebook.com/company", instagram: "instagram.com/company", linkedinProfile: "linkedin.com/company/company", googleProfile: "maps.example.com", website: "example.com" },
    { opportunity: "Weak Website", email: "second@example.com", phone: "456", website: "second.com" },
    { opportunity: "Weak SEO", email: "seo@example.com", phone: "789", website: "seo.com" },
  ];

  it("combines opportunity and availability filters with AND semantics", () => {
    expect(filterLeads(leads, "Weak Website", ["Email", "WhatsApp"])).toHaveLength(1);
    expect(filterLeads(leads, "Weak Website", ["Email"])).toHaveLength(2);
    expect(filterLeads(leads, "All", ["Website", "Phone"])).toHaveLength(3);
  });

  it("supports the complete canonical contact-data filter list", () => {
    expect(filterLeads(leads, "Weak Website", ["Business Email", "Owner / Manager Email", "CEO / Founder Email", "Phone Number", "WhatsApp Number", "Facebook Page", "Instagram", "LinkedIn Profile", "Google Business Profile", "Website"])).toHaveLength(1);
    expect(hasAvailableData(leads[0], "Facebook Page")).toBe(true);
    expect(hasAvailableData(leads[0], "Instagram")).toBe(true);
    expect(hasAvailableData(leads[0], "LinkedIn Profile")).toBe(true);
  });

  it("recognizes empty availability values as missing and preserves legacy filter aliases", () => {
    expect(hasAvailableData(leads[0], "Google Profile")).toBe(true);
    expect(hasAvailableData(leads[1], "Google Profile")).toBe(false);
    expect(hasAvailableData(leads[1], "WhatsApp")).toBe(false);
    expect(hasAvailableData(leads[0], "Email")).toBe(true);
  });
});
