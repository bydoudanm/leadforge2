export type OutreachQueueFilter = "all" | "individual" | "company";

export function filterOutreachItems<T extends { searchMode?: string | null }>(items: T[], filter: OutreachQueueFilter) {
  if (filter === "all") return items;
  return items.filter((item) => filter === "company" ? item.searchMode === "company" : item.searchMode !== "company");
}
