export type OutreachMode = "individual" | "company";

export type OutreachAgentInput = {
  searchMode: OutreachMode;
  businessName?: string;
  recipientName?: string;
  recipientRole?: string;
  parentCompanyName?: string;
  branchName?: string;
  branchCount?: number;
  opportunity?: string;
  category?: string;
  location?: string;
  language?: string;
};

export function buildOutreachAgentMessages(input: OutreachAgentInput) {
  const isCompanyMode = input.searchMode === "company";
  const businessName = input.businessName || input.branchName || input.parentCompanyName || "the business";
  const recipient = input.recipientName || (isCompanyMode ? input.parentCompanyName || "the company team" : "the owner or manager");
  const role = input.recipientRole || (isCompanyMode ? "CEO or Founder" : "Owner or Manager");
  const language = input.language || "English";
  const opportunity = input.opportunity || "online presence";
  const category = input.category || "business";
  const location = input.location || "the local market";
  const branchCount = input.branchCount || 1;

  return {
    system: isCompanyMode
      ? "You are LeadForge's Company Acquisition Agent. You write outcome-driven outreach to parent-company decision makers, using branch coverage and scale value without confusing the recipient with a local branch contact."
      : "You are LeadForge's Individual Acquisition Agent. You write outcome-driven outreach to an owner or manager of one business, using the business's own opportunity without referring to parent-company strategy.",
    user: isCompanyMode
      ? `Write a concise, highly personalized B2B outreach email in ${language} to the ${role} of parent company "${input.parentCompanyName}". Mention that "${input.branchName}" in ${location} is one of ${branchCount} managed locations and that the opportunity is "${opportunity}" in the ${category} sector. Focus on the value of solving the issue once across the parent company's branches. Do not address the branch owner as an individual.`
      : `Write a concise, highly personalized B2B outreach email in ${language} to ${recipient}, the ${role} of "${businessName}". Mention the business opportunity "${opportunity}" in the ${category} sector and the location ${location}. Focus on the specific business outcome and a low-friction conversation. Do not mention parent companies, branches, or multi-location rollups.`,
  };
}

export function buildOutreachFallback(input: OutreachAgentInput) {
  const isCompanyMode = input.searchMode === "company";
  const businessName = input.businessName || input.branchName || input.parentCompanyName || "the business";
  const recipient = input.recipientName || (isCompanyMode ? input.parentCompanyName || "the company team" : "the owner or manager");
  const opportunity = input.opportunity || (isCompanyMode ? "your online presence" : "online presence");
  const location = input.location || "your region";
  const branchCount = input.branchCount || 1;

  return isCompanyMode
    ? `Hi ${input.parentCompanyName},\n\nI noticed ${input.branchName} is one of ${branchCount} managed locations for ${input.parentCompanyName} in ${location}. We specialize in solving ${opportunity} opportunities across multi-location groups.\n\nAre you open to a brief conversation about a scalable approach?\n\nBest regards,\nGrowth Team`
    : `Hi ${recipient},\n\nI noticed ${businessName} could turn its ${opportunity} opportunity into more customers. I would love to share a practical way to help.\n\nWould you be open to a brief conversation?\n\nBest regards,\nGrowth Team`;
}
