export type CompanyHierarchyProfile = {
  id: string;
  parentCompanyName: string;
  headquartersLocation: string;
  parentCompanyEmail: string;
  parentFounderEmail: string;
  parentLinkedinProfile: string;
  branchLocations: string[];
};

export type CompanyHierarchyLead = {
  id: number;
  company: string;
  category: string;
  opportunity: string;
  score: number;
  email?: string;
  phone?: string;
  website?: string;
  location: string;
  parentCompanyId: string;
};

export type ParentCompanyOutreachLead = {
  companyName: string;
  parentCompanyName: string;
  parentCompanyEmail: string;
  parentFounderEmail: string;
  branchCount: number;
  branchLocations: string[];
  category: string;
  opportunity: string;
  score: number;
  email: string;
  phone?: string;
  website?: string;
  location: string;
  searchMode: "company";
};

export const companyHierarchyProfiles: Record<string, CompanyHierarchyProfile> = {
  "pacific-table-hospitality": {
    id: "pacific-table-hospitality",
    parentCompanyName: "Pacific Table Hospitality Group",
    headquartersLocation: "Los Angeles, CA",
    parentCompanyEmail: "partnerships@pacifictablehospitality.com",
    parentFounderEmail: "elena.rossi@pacifictablehospitality.com",
    parentLinkedinProfile: "linkedin.com/company/pacific-table-hospitality",
    branchLocations: ["Los Angeles, CA", "Santa Monica, CA", "Pasadena, CA", "San Diego, CA"],
  },
  "burger-spot-group": {
    id: "burger-spot-group",
    parentCompanyName: "The Burger Spot Group",
    headquartersLocation: "Los Angeles, CA",
    parentCompanyEmail: "growth@theburgerspotgroup.com",
    parentFounderEmail: "founder@theburgerspotgroup.com",
    parentLinkedinProfile: "linkedin.com/company/the-burger-spot-group",
    branchLocations: ["Los Angeles, CA"],
  },
  "harborview-coffee-group": {
    id: "harborview-coffee-group",
    parentCompanyName: "Harborview Coffee Group",
    headquartersLocation: "San Diego, CA",
    parentCompanyEmail: "hello@harborviewcoffeegroup.com",
    parentFounderEmail: "founder@harborviewcoffeegroup.com",
    parentLinkedinProfile: "linkedin.com/company/harborview-coffee-group",
    branchLocations: ["San Diego, CA", "La Jolla, CA"],
  },
};

export function getCompanyHierarchy(parentCompanyId: string): CompanyHierarchyProfile {
  return companyHierarchyProfiles[parentCompanyId] ?? {
    id: parentCompanyId,
    parentCompanyName: "Independent Company",
    headquartersLocation: "Unknown",
    parentCompanyEmail: "",
    parentFounderEmail: "",
    parentLinkedinProfile: "",
    branchLocations: [],
  };
}

export function rollUpCompanyResults<T extends CompanyHierarchyLead>(
  leads: T[],
): T[] {
  const grouped = new Map<string, T>();
  for (const lead of leads) {
    const current = grouped.get(lead.parentCompanyId);
    if (!current || lead.score > current.score) grouped.set(lead.parentCompanyId, lead);
  }
  return Array.from(grouped.values());
}

export function buildParentCompanyOutreachRows(
  leads: CompanyHierarchyLead[],
  profiles: Record<string, CompanyHierarchyProfile> = companyHierarchyProfiles,
): ParentCompanyOutreachLead[] {
  const grouped = new Map<string, ParentCompanyOutreachLead>();
  for (const lead of leads) {
    if (grouped.has(lead.parentCompanyId)) continue;
    const profile = profiles[lead.parentCompanyId] ?? getCompanyHierarchy(lead.parentCompanyId);
    grouped.set(lead.parentCompanyId, {
      companyName: profile.parentCompanyName,
      parentCompanyName: profile.parentCompanyName,
      parentCompanyEmail: profile.parentCompanyEmail,
      parentFounderEmail: profile.parentFounderEmail,
      branchCount: profile.branchLocations.length || 1,
      branchLocations: profile.branchLocations.length > 0 ? profile.branchLocations : [lead.location],
      category: lead.category,
      opportunity: lead.opportunity,
      score: lead.score,
      email: profile.parentCompanyEmail || profile.parentFounderEmail || lead.email || "",
      phone: lead.phone,
      website: lead.website,
      location: profile.headquartersLocation || lead.location,
      searchMode: "company",
    });
  }
  return Array.from(grouped.values());
}
