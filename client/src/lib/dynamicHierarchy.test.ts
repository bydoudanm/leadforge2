import { describe, expect, it } from "vitest";
import { detectAndGroupCompanies, type RawCompanyLead } from "./dynamicHierarchy";

const testLeads: RawCompanyLead[] = [
  {
    id: 101,
    company: "Metro Burger Downtown",
    category: "Restaurant",
    opportunity: "Weak Website",
    score: 88,
    employeeCount: 15,
    annualRevenue: 1500000,
    location: "Madrid, ES",
  },
  {
    id: 102,
    company: "Metro Burger Airport",
    category: "Restaurant",
    opportunity: "Weak SEO",
    score: 92,
    employeeCount: 20,
    annualRevenue: 2200000,
    location: "Madrid, ES",
  },
];

describe("dynamic company hierarchy detection", () => {
  it("clusters similar branch names into a parent company group", () => {
    const groups = detectAndGroupCompanies(testLeads);
    expect(groups).toHaveLength(1);
    expect(groups[0]?.branchCount).toBe(2);
    expect(groups[0]?.representativeLead.id).toBe(102);
  });
});
