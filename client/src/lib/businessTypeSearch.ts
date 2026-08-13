export type BusinessTypeSuggestion = {
  label: string;
  aliases: string[];
  semanticLabel: string;
};

export type BusinessTypeMatchMode = "suggested" | "exact";

const suggestionSeed: BusinessTypeSuggestion[] = [
  { label: "Restaurant", aliases: ["res", "rest", "food"], semanticLabel: "Restaurant Businesses" },
  { label: "Café & Bakery", aliases: ["cafe", "bakery", "bake"], semanticLabel: "Cafés & Bakeries" },
  { label: "Plumber", aliases: ["pl", "plu", "plum", "plumb", "plumbing"], semanticLabel: "Plumber / Plumbing Companies" },
  { label: "Electrician", aliases: ["elec", "electrical"], semanticLabel: "Electrician Businesses" },
  { label: "Dental Clinic", aliases: ["dent", "dental", "dentist"], semanticLabel: "Dental Clinics / Dentists" },
  { label: "Real Estate Agency", aliases: ["real", "estate", "realtor", "property"], semanticLabel: "Real Estate Businesses / Agencies" },
  { label: "Law Firm", aliases: ["law", "legal", "attorney"], semanticLabel: "Law Firms" },
  { label: "Accounting Firm", aliases: ["account", "accounting", "cpa"], semanticLabel: "Accounting Firms" },
  { label: "Car Rental Company", aliases: ["car", "rental", "rent a car"], semanticLabel: "Car Rental Companies" },
  { label: "Software Company", aliases: ["software", "saas", "tech"], semanticLabel: "Software Companies" },
  { label: "AI Automation Agency", aliases: ["ai", "automation", "ai automation", "automation agency"], semanticLabel: "AI Automation Agencies" },
  { label: "Digital Marketing Agency", aliases: ["digital", "marketing", "seo", "media agency"], semanticLabel: "Digital Marketing Agencies" },
  { label: "Web Development Agency", aliases: ["web", "website", "development"], semanticLabel: "Web Development Agencies" },
  { label: "Cleaning Company", aliases: ["clean", "cleaning", "janitorial"], semanticLabel: "Cleaning Companies" },
  { label: "Fitness Gym & Yoga Studio", aliases: ["gym", "fitness", "yoga"], semanticLabel: "Fitness & Yoga Businesses" },
  { label: "Auto Repair & Mechanics", aliases: ["auto", "mechanic", "repair", "car repair"], semanticLabel: "Auto Repair Businesses" },
  { label: "HVAC Contractor", aliases: ["hvac", "heating", "cooling"], semanticLabel: "HVAC Contractors" },
  { label: "Roofing Contractor", aliases: ["roof", "roofing"], semanticLabel: "Roofing Contractors" },
  { label: "Landscaping & Gardening", aliases: ["land", "landscaping", "garden"], semanticLabel: "Landscaping Businesses" },
  { label: "Hair Salon & Barber", aliases: ["hair", "salon", "barber"], semanticLabel: "Hair Salons & Barbers" },
  { label: "Spa & Wellness", aliases: ["spa", "wellness"], semanticLabel: "Spa & Wellness Businesses" },
  { label: "Hotel & Hospitality", aliases: ["hotel", "hospitality", "lodging"], semanticLabel: "Hotels & Hospitality Businesses" },
  { label: "Veterinary Clinic", aliases: ["vet", "veterinary", "animal"], semanticLabel: "Veterinary Clinics" },
];

const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");

const genericIntentWords = /\b(agencies|companies|businesses|firms|clinics|contractors|studios|salons|restaurants|services)\b/g;

function getQueryVariants(query: string): string[] {
  const normalizedQuery = normalize(query);
  const withoutGenericIntentWords = normalize(normalizedQuery.replace(genericIntentWords, " "));
  return Array.from(new Set([normalizedQuery, withoutGenericIntentWords].filter(Boolean)));
}

export function getBusinessTypeSuggestions(query: string, limit = 6): BusinessTypeSuggestion[] {
  const queryVariants = getQueryVariants(query);
  if (queryVariants.length === 0) return [];

  return suggestionSeed
    .filter((suggestion) => {
      const label = normalize(suggestion.label);
      return queryVariants.some((variant) => label.includes(variant) || suggestion.aliases.some((alias) => normalize(alias).startsWith(variant)));
    })
    .sort((left, right) => {
      const leftLabel = normalize(left.label);
      const rightLabel = normalize(right.label);
      const leftStarts = queryVariants.some((variant) => leftLabel.startsWith(variant)) ? 0 : 1;
      const rightStarts = queryVariants.some((variant) => rightLabel.startsWith(variant)) ? 0 : 1;
      return leftStarts - rightStarts || leftLabel.localeCompare(rightLabel);
    })
    .slice(0, limit);
}

export function matchesBusinessTypeQuery(value: string, query: string): boolean {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return true;
  return normalize(value).includes(normalizedQuery);
}

export function matchesBusinessTypeResult(value: string, query: string, mode: BusinessTypeMatchMode = "exact"): boolean {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return true;
  if (matchesBusinessTypeQuery(value, normalizedQuery)) return true;
  if (mode !== "suggested") return false;

  const suggestion = suggestionSeed.find((candidate) => normalize(candidate.label) === normalizedQuery);
  return Boolean(suggestion && normalize(suggestion.semanticLabel).includes(normalize(value)));
}

export function filterBusinessTypeResults<T>(
  results: readonly T[],
  query: string,
  mode: BusinessTypeMatchMode,
  getSearchableText: (result: T) => string,
): T[] {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return [...results];
  return results.filter((result) => matchesBusinessTypeResult(getSearchableText(result), normalizedQuery, mode));
}

export function getBusinessTypeSuggestionSummary(suggestion: BusinessTypeSuggestion, locationLabel?: string): string {
  return `${suggestion.semanticLabel}${locationLabel ? ` in ${locationLabel}` : ""}`;
}

export const businessTypeSuggestionCatalog = suggestionSeed;

export function normalizeBusinessTypeQuery(value: string): string {
  return normalize(value);
}
