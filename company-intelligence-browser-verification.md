# Company Intelligence Browser Verification

- Company Lead Search renders the seeded demo result `Atlas Commerce Group (Demo)` with four managed branches.
- The selected detail panel visibly labels it `Demo company` and shows parent-company context, headquarters, parent email, founder email, employee count, revenue, and branch coverage.
- The Company intelligence signals panel renders LinkedIn, Facebook, Instagram, and X links for the parent company.
- The panel renders a clearly labeled `Latest news / intelligence signal` entry marked `Demo fixture`, sourced from LeadForge demo intelligence.
- The demo fixture intentionally shows `No review data supplied for this demo fixture` rather than fabricated customer review content.

- After selecting the demo company and clicking `Generate English company email`, the generated message became visible in the outreach panel.
- The generated copy used a parent-company subject, addressed the CEO/founder role, referenced Atlas Commerce Group (Demo), Atlas Commerce Austin Demo, Austin, the E-commerce category, the Weak Website opportunity, and all four managed locations.
- The message also used the demo latest-news signal as personalization context and kept the parent-level scale strategy distinct from branch-owner outreach.
- The generated output was visibly longer and more specific than the default preview text, confirming the Company-mode agent path is active.

# Outreach Queue Filter Verification

- The queue rendered `All campaigns`, `Individual campaigns`, and `Company campaigns` controls with accessible pressed-state behavior.
- The default All view showed three persisted Company Outreach parent targets.
- Selecting Company campaigns kept the three parent-company rows visible and showed `Queued Targets (3 of 3)`.
- Selecting Individual campaigns removed the company rows and correctly showed `No individual campaigns are currently queued.` with `Queued Targets (0 of 3)`.

- The final Company Lead Search results table now includes a visible `Signals` column.
- Existing parent rows show compact `LI`, `FB`, and `IG` indicators; Harborview and the Atlas demo row additionally show `News`.
- The Atlas Commerce Group (Demo) row visibly renders `LI FB IG News`, so social/news availability is discoverable without opening the detail panel.
