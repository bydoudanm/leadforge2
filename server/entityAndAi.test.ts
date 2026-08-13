import { describe, expect, it } from "vitest";
import { matchesCompanyProfileFilters } from "../client/src/lib/companyLeadFilters";

describe("Entity filtering and AI outreach logic", () => {
  it("filters parent vs branch correctly", () => {
    const parentLead = { id: 1, employeeCount: 50, annualRevenue: 5000000, parentCompanyId: "group-1" };
    const branchLead = { id: 2, employeeCount: 10, annualRevenue: 800000, parentCompanyId: "single-2" };

    expect(matchesCompanyProfileFilters(parentLead, undefined, undefined, "parent")).toBe(true);
    expect(matchesCompanyProfileFilters(branchLead, undefined, undefined, "parent")).toBe(false);

    expect(matchesCompanyProfileFilters(branchLead, undefined, undefined, "branch")).toBe(true);
    expect(matchesCompanyProfileFilters(parentLead, undefined, undefined, "branch")).toBe(false);
  });
});
