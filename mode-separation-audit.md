# LeadForge Mode Separation Audit

## Confirmed existing separation

LeadForge already has two independent routes: `/lead-search` for the `individual` search mode and `/company-lead-search` for the `company` search mode. Both pages expose `data-search-mode`, persist saved filters under separate `searchMode` values, and use the same approved visual system. The Company page already has company-only employee, revenue, entity-type, hierarchy, parent-company rollup, and parent-company outreach payloads.

The Sidebar is currently duplicated across the search pages, Dashboard, and Outreach. It already shows both `Lead Search` and `Company Lead Search`, but because the markup is repeated, labels and behavior can drift. The top navigation also uses a generic `Search` item that always routes to `/lead-search`, which does not communicate the Individual/Company distinction clearly.

## Gaps to close

Individual Search currently sends rows to Outreach with individual lead fields, but its detail panel only contains static outreach copy and its Generate button is not connected to the AI endpoint. Company Search has a company-specific AI endpoint and parent-company payload, but its visible Generate button is also not wired to the handler. The AI endpoint contract is company-only, so it cannot represent an Individual recipient such as an owner or manager.

Outreach preserves `searchMode` and displays different source labels, but the table is company-oriented for all rows: it uses Parent Company, Branches, and Parent Contact columns even for Individual Search items. This makes the downstream distinction visually and operationally incomplete.

## Implementation boundary

Preserve the existing dark/white themes, layout, cards, filters, search logic, and approved styling. Add a shared acquisition sidebar with the same current styling and explicit Individual/Company subtitles. Keep `/lead-search` as the Individual route and `/company-lead-search` as the Company route. Add mode-aware AI outreach generation: Individual mode addresses an owner or manager at the selected business; Company mode addresses a CEO, founder, or company contact and references managed branches. Update the Outreach queue presentation so Individual rows show individual-target fields while Company rows show parent-company and branch fields. Add tests and browser checks for both paths.
