import { describe, expect, it } from "vitest";
import { buildParentCompanyOutreachRows, rollUpCompanyResults, type CompanyHierarchyLead } from "./companyHierarchy";

const sampleLeads: CompanyHierarchyLead[] = [
  {
    id: 1,
    company: "Downtown Branch",
    category: "Restaurant",
    opportunity: "Weak Website",
    score: 84,
    email: "branch@example.com",
    phone: "555-0100",
    website: "downtown.example.com",
    location: "Madrid, ES",
    parentCompanyId: "parent-a",
  },
  {
    id: 2,
    company: "Airport Branch",
    category: "Restaurant",
    opportunity: "Weak SEO",
    score: 91,
    email: "airport@example.com",
    phone: "555-0101",
    website: "airport.example.com",
    location: "Madrid, ES",
    parentCompanyId: "parent-a",
  },
  {
    id: 3,
    company: "Independent Studio",
    category: "Agency",
    opportunity: "Media Opportunity",
    score: 78,
    email: "studio@example.com",
    phone: "555-0102",
    website: "studio.example.com",
    location: "Madrid, ES",
    parentCompanyId: "parent-b",
  },
];

describe("company hierarchy semantics", () => {
  it("rolls multiple matching branches into the highest-scoring parent result", () => {
    const rolledUp = rollUpCompanyResults(sampleLeads);
    expect(rolledUp).toHaveLength(2);
    expect(rolledUp.find((lead) => lead.parentCompanyId === "parent-a")?.company).toBe("Airport Branch");
  });

  it("creates one parent-company outreach target per hierarchy group", () => {
    const rows = buildParentCompanyOutreachRows(sampleLeads, {
      "parent-a": {
        id: "parent-a",
        parentCompanyName: "Madrid Hospitality Group",
        headquartersLocation: "Madrid, ES",
        parentCompanyEmail: "hq@madridhospitality.example",
        parentFounderEmail: "founder@madridhospitality.example",
        parentLinkedinProfile: "linkedin.com/company/madrid-hospitality",
        branchLocations: ["Madrid, ES", "Toledo, ES"],
      },
      "parent-b": {
        id: "parent-b",
        parentCompanyName: "Independent Studio",
        headquartersLocation: "Madrid, ES",
        parentCompanyEmail: "hello@studio.example",
        parentFounderEmail: "founder@studio.example",
        parentLinkedinProfile: "linkedin.com/company/studio",
        branchLocations: ["Madrid, ES"],
      },
    });
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      companyName: "Madrid Hospitality Group",
      email: "hq@madridhospitality.example",
      branchCount: 2,
      searchMode: "company",
    });
  });
});
