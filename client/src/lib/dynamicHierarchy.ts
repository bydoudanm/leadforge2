export type RawCompanyLead = {
  id: number;
  company: string;
  category: string;
  opportunity: string;
  score: number;
  email?: string;
  phone?: string;
  website?: string;
  location?: string;
  employeeCount: number;
  annualRevenue: number;
  founderEmail?: string;
  linkedinProfile?: string;
  parentCompanyId?: string;
};

export type DynamicGroupedCompany = {
  parentCompanyId: string;
  parentCompanyName: string;
  headquartersLocation: string;
  parentCompanyEmail: string;
  parentFounderEmail: string;
  parentLinkedinProfile: string;
  branchCount: number;
  branches: RawCompanyLead[];
  representativeLead: RawCompanyLead;
};

export function detectAndGroupCompanies(leads: RawCompanyLead[]): DynamicGroupedCompany[] {
  const groups: Record<string, RawCompanyLead[]> = {};

  for (const lead of leads) {
    const cleanName = lead.company
      .replace(/(downtown|airport|branch|location|store|cafe|coffee|restaurant|spot|house|group|co\.|llc|inc\.?)/gi, "")
      .replace(/[^a-z0-9]/g, "")
      .trim()
      .toLowerCase();
    const key = cleanName.length > 2 ? cleanName : lead.company.trim().toLowerCase();
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(lead);
  }

  const result: DynamicGroupedCompany[] = [];

  for (const [key, branchList] of Object.entries(groups)) {
    const sorted = [...branchList].sort((a, b) => b.score - a.score);
    const best = sorted[0];
    const parentName = best.company.includes("Group") || best.company.includes("Co.")
      ? best.company
      : `${best.company.split(" ")[0]} Hospitality Group`;
    
    const parentId = `dynamic-${key.replace(/[^a-z0-9]/g, "-")}`;
    const headLoc = best.location || "Los Angeles, CA";

    result.push({
      parentCompanyId: parentId,
      parentCompanyName: parentName,
      headquartersLocation: headLoc,
      parentCompanyEmail: best.email || `partnerships@${key.replace(/[^a-z0-9]/g, "")}group.example`,
      parentFounderEmail: best.founderEmail || `founder@${key.replace(/[^a-z0-9]/g, "")}group.example`,
      parentLinkedinProfile: best.linkedinProfile || `linkedin.com/company/${key.replace(/[^a-z0-9]/g, "-")}`,
      branchCount: sorted.length,
      branches: sorted,
      representativeLead: {
        ...best,
        parentCompanyId: parentId,
      },
    });
  }

  return result;
}
