import { describe, expect, it } from "vitest";
import { matchesCompanyProfileFilters } from "./companyLeadFilters";

const employeeBands = {
  small: { value: "1-10", min: 1, max: 10 },
  mid: { value: "11-50", min: 11, max: 50 },
};

const revenueBands = {
  starter: { value: "under-1m", min: 0, max: 999_999 },
  growth: { value: "1m-5m", min: 1_000_000, max: 4_999_999 },
};

describe("matchesCompanyProfileFilters", () => {
  it("matches an employee-size band", () => {
    expect(matchesCompanyProfileFilters({ employeeCount: 24, annualRevenue: 2_800_000 }, employeeBands.mid)).toBe(true);
    expect(matchesCompanyProfileFilters({ employeeCount: 8, annualRevenue: 750_000 }, employeeBands.mid)).toBe(false);
  });

  it("matches an annual-revenue band", () => {
    expect(matchesCompanyProfileFilters({ employeeCount: 8, annualRevenue: 750_000 }, undefined, revenueBands.starter)).toBe(true);
    expect(matchesCompanyProfileFilters({ employeeCount: 24, annualRevenue: 2_800_000 }, undefined, revenueBands.starter)).toBe(false);
  });

  it("requires both selected company filters to match", () => {
    expect(matchesCompanyProfileFilters({ employeeCount: 24, annualRevenue: 2_800_000 }, employeeBands.mid, revenueBands.growth)).toBe(true);
    expect(matchesCompanyProfileFilters({ employeeCount: 24, annualRevenue: 750_000 }, employeeBands.mid, revenueBands.growth)).toBe(false);
  });

  it("returns all company profiles when no company filter is selected", () => {
    expect(matchesCompanyProfileFilters({ employeeCount: 24, annualRevenue: 2_800_000 })).toBe(true);
  });
});
