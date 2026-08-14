import { describe, expect, it } from "vitest";
import { buildOutreachAgentMessages, buildOutreachFallback } from "./outreachAgent";

describe("AI Outreach Generation", () => {
  it("keeps Individual outreach focused on an owner or manager", () => {
    const messages = buildOutreachAgentMessages({
      searchMode: "individual",
      businessName: "North Star Plumbing",
      recipientName: "the owner or manager",
      recipientRole: "Owner or Manager",
      opportunity: "Weak Website",
      category: "Plumber",
      location: "Madrid, ES",
      language: "English",
    });

    expect(messages.system).toContain("Individual Acquisition Agent");
    expect(messages.user).toContain("Owner or Manager");
    expect(messages.user).toContain("North Star Plumbing");
    expect(messages.user).toContain("Do not mention parent companies");
    expect(messages.user).toContain("low-friction conversation");
  });

  it("keeps Company outreach focused on parent-company scale", () => {
    const messages = buildOutreachAgentMessages({
      searchMode: "company",
      parentCompanyName: "Madrid Hospitality Group",
      branchName: "Downtown Branch",
      branchCount: 3,
      opportunity: "Weak Website",
      category: "Restaurant",
      location: "Madrid, ES",
      language: "English",
      socialProfiles: ["linkedin.com/company/madrid-hospitality"],
      latestNews: "Group expansion signal",
    });

    expect(messages.system).toContain("Company Acquisition Agent");
    expect(messages.user).toContain("CEO or Founder");
    expect(messages.user).toContain("Madrid Hospitality Group");
    expect(messages.user).toContain("3 managed locations");
    expect(messages.user).toContain("parent company's branches");
    expect(messages.user).toContain("linkedin.com/company/madrid-hospitality");
    expect(messages.user).toContain("Group expansion signal");
    expect(messages.user).toContain("Do not address the branch owner as an individual");
  });

  it("uses distinct safe fallbacks for the two outreach modes", () => {
    const individualFallback = buildOutreachFallback({
      searchMode: "individual",
      businessName: "North Star Plumbing",
      recipientName: "the owner or manager",
      opportunity: "Weak SEO",
    });
    const companyFallback = buildOutreachFallback({
      searchMode: "company",
      parentCompanyName: "Madrid Hospitality Group",
      branchName: "Downtown Branch",
      branchCount: 3,
      opportunity: "Weak Website",
    });

    expect(individualFallback).toContain("North Star Plumbing");
    expect(individualFallback).not.toContain("managed locations");
    expect(companyFallback).toContain("3 managed locations");
    expect(companyFallback).toContain("Madrid Hospitality Group");
  });
});
