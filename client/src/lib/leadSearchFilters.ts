export type AvailabilityFilter = "Email" | "Phone" | "WhatsApp" | "Google Profile" | "Website";

export const availabilityFilterOptions: readonly AvailabilityFilter[] = [
  "Email",
  "Phone",
  "WhatsApp",
  "Google Profile",
  "Website",
];

export type LeadFilterRecord = {
  opportunity: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  googleProfile?: string;
  website?: string;
};

export function hasAvailableData(lead: LeadFilterRecord, filter: AvailabilityFilter) {
  switch (filter) {
    case "Email":
      return Boolean(lead.email?.trim());
    case "Phone":
      return Boolean(lead.phone?.trim());
    case "WhatsApp":
      return Boolean(lead.whatsapp?.trim());
    case "Google Profile":
      return Boolean(lead.googleProfile?.trim());
    case "Website":
      return Boolean(lead.website?.trim());
  }
}

export function filterLeads<T extends LeadFilterRecord>(leads: T[], selectedTab: string, selectedDataFilters: readonly AvailabilityFilter[]) {
  const opportunityLeads = selectedTab === "All" ? leads : leads.filter((lead) => lead.opportunity === selectedTab);
  if (selectedDataFilters.length === 0) return opportunityLeads;
  return opportunityLeads.filter((lead) => selectedDataFilters.every((filter) => hasAvailableData(lead, filter)));
}
