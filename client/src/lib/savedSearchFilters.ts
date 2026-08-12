import type { AvailabilityFilter } from "./leadSearchFilters";

export type SearchMode = "individual" | "company";

export type SavedFilterPayload = {
  selectedTab: string;
  selectedDataFilters: AvailabilityFilter[];
  selectedOpportunities: string[];
  selectedContacts: string[];
  selectedCountry: string;
  countryInput: string;
  selectedRegion: string;
  selectedRegionCode: string;
  selectedCity: string;
  businessType: string;
  requestedResultCount: string;
};

export type SavedFilterView = {
  id: number;
  name: string;
  searchMode: SearchMode;
  filters: SavedFilterPayload;
  createdAt: string;
  updatedAt: string;
};

export function buildSavedFilterPayload(input: SavedFilterPayload): SavedFilterPayload {
  return {
    ...input,
    selectedDataFilters: [...input.selectedDataFilters],
    selectedOpportunities: [...input.selectedOpportunities],
    selectedContacts: [...input.selectedContacts],
  };
}
