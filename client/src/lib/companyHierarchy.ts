export type CompanyNewsSignal = {
  headline: string;
  source: string;
  publishedAt: string;
  url?: string;
  demoOnly?: boolean;
};

export type CompanyHierarchyProfile = {
  id: string;
  parentCompanyName: string;
  headquartersLocation: string;
  parentCompanyEmail: string;
  parentFounderEmail: string;
  parentLinkedinProfile: string;
  parentFacebookPage?: string;
  parentInstagram?: string;
  parentXProfile?: string;
  latestNews?: CompanyNewsSignal;
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
  parentLinkedinProfile?: string;
  parentFacebookPage?: string;
  parentInstagram?: string;
  parentXProfile?: string;
  latestNews?: CompanyNewsSignal;
};

export const companyHierarchyProfiles: Record<string, CompanyHierarchyProfile> = {
  "pacific-table-hospitality": {
    id: "pacific-table-hospitality",
    parentCompanyName: "Pacific Table Hospitality Group",
    headquartersLocation: "Los Angeles, CA",
    parentCompanyEmail: "partnerships@pacifictablehospitality.com",
    parentFounderEmail: "elena.rossi@pacifictablehospitality.com",
    parentLinkedinProfile: "linkedin.com/company/pacific-table-hospitality",
    parentFacebookPage: "facebook.com/pacifictablehospitality",
    parentInstagram: "instagram.com/pacifictablehospitality",
    branchLocations: ["Los Angeles, CA", "Santa Monica, CA", "Pasadena, CA", "San Diego, CA"],
  },
  "burger-spot-group": {
    id: "burger-spot-group",
    parentCompanyName: "The Burger Spot Group",
    headquartersLocation: "Los Angeles, CA",
    parentCompanyEmail: "growth@theburgerspotgroup.com",
    parentFounderEmail: "founder@theburgerspotgroup.com",
    parentLinkedinProfile: "linkedin.com/company/the-burger-spot-group",
    parentFacebookPage: "facebook.com/theburgerspotgroup",
    parentInstagram: "instagram.com/theburgerspotgroup",
    branchLocations: ["Los Angeles, CA"],
  },
  "harborview-coffee-group": {
    id: "harborview-coffee-group",
    parentCompanyName: "Harborview Coffee Group",
    headquartersLocation: "San Diego, CA",
    parentCompanyEmail: "hello@harborviewcoffeegroup.com",
    parentFounderEmail: "founder@harborviewcoffeegroup.com",
    parentLinkedinProfile: "linkedin.com/company/harborview-coffee-group",
    parentFacebookPage: "facebook.com/harborviewcoffeegroup",
    parentInstagram: "instagram.com/harborviewcoffeegroup",
    latestNews: {
      headline: "Harborview Coffee Group is expanding its local media presence",
      source: "LeadForge intelligence signal",
      publishedAt: "Current dataset",
    },
    branchLocations: ["San Diego, CA", "La Jolla, CA"],
  },
  "atlas-commerce-demo": {
    id: "atlas-commerce-demo",
    parentCompanyName: "Atlas Commerce Group (Demo)",
    headquartersLocation: "Austin, TX",
    parentCompanyEmail: "partnerships@atlascommerce.demo",
    parentFounderEmail: "founder@atlascommerce.demo",
    parentLinkedinProfile: "linkedin.com/company/atlas-commerce-group-demo",
    parentFacebookPage: "facebook.com/atlascommercegroupdemo",
    parentInstagram: "instagram.com/atlascommercegroupdemo",
    parentXProfile: "x.com/atlascommerce_demo",
    latestNews: {
      headline: "Demo signal: Atlas Commerce Group is evaluating a multi-location growth offer",
      source: "LeadForge demo intelligence",
      publishedAt: "Demo fixture",
      demoOnly: true,
    },
    branchLocations: ["Austin, TX", "Dallas, TX", "Houston, TX", "San Antonio, TX"],
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
      parentLinkedinProfile: profile.parentLinkedinProfile,
      parentFacebookPage: profile.parentFacebookPage,
      parentInstagram: profile.parentInstagram,
      parentXProfile: profile.parentXProfile,
      latestNews: profile.latestNews,
    });
  }
  return Array.from(grouped.values());
}
