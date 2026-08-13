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
  lead: CompanyFilterLead,
  employeeRange?: CompanyFilterOption,
  revenueRange?: CompanyFilterOption,
): boolean {
  const matchesEmployees = !employeeRange || (lead.employeeCount >= employeeRange.min && lead.employeeCount <= employeeRange.max);
  const matchesRevenue = !revenueRange || (lead.annualRevenue >= revenueRange.min && lead.annualRevenue <= revenueRange.max);
  return matchesEmployees && matchesRevenue;
}
