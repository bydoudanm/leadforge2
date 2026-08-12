export const availabilityFilterOptions = [
  "Business Email",
  "Owner / Manager Email",
  "CEO / Founder Email",
  "Phone Number",
  "WhatsApp Number",
  "Facebook Page",
  "Instagram",
  "LinkedIn Profile",
  "Google Business Profile",
  "Website",
] as const;

export type CanonicalAvailabilityFilter = (typeof availabilityFilterOptions)[number];
export type LegacyAvailabilityFilter = "Email" | "Phone" | "WhatsApp" | "Google Profile";
export type AvailabilityFilter = CanonicalAvailabilityFilter | LegacyAvailabilityFilter;

export type LeadFilterRecord = {
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

export function hasAvailableData(lead: LeadFilterRecord, filter: AvailabilityFilter) {
  switch (filter) {
    case "Business Email":
    case "Email":
      return Boolean(lead.email?.trim());
    case "Owner / Manager Email":
      return Boolean(lead.ownerEmail?.trim());
    case "CEO / Founder Email":
      return Boolean(lead.founderEmail?.trim());
    case "Phone Number":
    case "Phone":
      return Boolean(lead.phone?.trim());
    case "WhatsApp Number":
    case "WhatsApp":
      return Boolean(lead.whatsapp?.trim());
    case "Facebook Page":
      return Boolean(lead.facebookPage?.trim());
    case "Instagram":
      return Boolean(lead.instagram?.trim());
    case "LinkedIn Profile":
      return Boolean(lead.linkedinProfile?.trim());
    case "Google Business Profile":
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
