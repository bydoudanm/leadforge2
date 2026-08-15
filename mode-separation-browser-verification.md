# Individual vs Company mode browser verification

Verified on 2026-08-15 against the LeadForge dev preview.

## Individual route: `/lead-search`

The shared Sidebar displayed `Lead Search` with the `Individual mode` label and `Company Lead Search` with the `Company mode` label. The page content used individual semantics: `# Lead Search`, owner/manager-oriented lead detail data, `AI Individual Outreach · Owner / Manager`, and the generated copy began with `Hi the owner or manager`.

The Individual results table used `Business Name`, `Category`, `Opportunity`, and `Score`, and the selected detail panel exposed an owner/manager email rather than parent-company hierarchy data.

## Company route: `/company-lead-search`

The shared Sidebar displayed the same two explicitly labeled modes. The page content used company semantics: `# Company Lead Search`, the subtitle `Find the parent company behind high-intent branches, reach the CEO or founder once, and scale one offer across every managed location.`, and Company Profile Filters for entity type, employee count, and annual revenue.

The Company results table used `Company / Parent`, branch counts, and social/news signal indicators. The selected detail panel displayed `Parent company`, `Managed Branches`, `Company Email`, `CEO / Founder Email`, `Parent LinkedIn`, and `AI Company Outreach · CEO / Founder`. The generated copy addressed `Pacific Table Hospitality Group` and referenced its managed locations, confirming parent-company outreach context rather than individual owner/manager context.

## Outcome

Both modes are visibly distinct at navigation, page header, results semantics, detail-panel data, and AI outreach context while preserving the shared acquisition UI structure. No code or visual redesign was required for this verification pass.
