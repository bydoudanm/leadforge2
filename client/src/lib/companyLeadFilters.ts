export type CompanyFilterLead = {
  employeeCount: number;
  annualRevenue: number;
};

export type CompanyFilterOption = {
  value: string;
  min: number;
  max: number;
};

export function matchesCompanyProfileFilters(
  lead: CompanyFilterLead & { parentCompanyId?: string },
  employeeRange?: CompanyFilterOption,
  revenueRange?: CompanyFilterOption,
  entityType: string = "all",
): boolean {
  if (entityType === "parent" && (!lead.parentCompanyId || lead.parentCompanyId.startsWith("single"))) return false;
  if (entityType === "branch" && lead.parentCompanyId && !lead.parentCompanyId.startsWith("single")) return false;
  const matchesEmployees = !employeeRange || (lead.employeeCount >= employeeRange.min && lead.employeeCount <= employeeRange.max);
  const matchesRevenue = !revenueRange || (lead.annualRevenue >= revenueRange.min && lead.annualRevenue <= revenueRange.max);
  return matchesEmployees && matchesRevenue;
}
