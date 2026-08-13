# Project TODO

- [x] Preserve the existing LeadForge landing page and visual identity
- [x] Add persistent database schema for users, leads, campaigns, opportunities, analytics, inboxes, and templates
- [x] Add a stable server API layer for dashboard data
- [x] Connect the Dashboard route to the existing app router
- [x] Implement authenticated user entry and protected Dashboard access
- [x] Connect Dashboard metrics, charts, and recent leads to persisted data
- [x] Add dashboard API, authentication, and session persistence Vitest coverage
- [x] Run typecheck, tests, and production build
- [x] Save a final checkpoint for user review

- [x] Add backend database helper and API endpoints for updating profile details and changing passwords
- [x] Create the protected ProfileSettings page component with account and password update forms
- [x] Add sidebar navigation links to easily switch between Dashboard and Settings
- [x] Add Vitest tests for profile updates and password validation
- [x] Run typecheck, tests, and build, then save a checkpoint for the profile settings feature
- [x] Save a webdev checkpoint for the profile settings feature

- [x] Add notification preference columns to the users schema and apply migration
- [x] Add database and API handlers for updating notification preferences
- [x] Add notification preference toggles to the ProfileSettings page UI
- [x] Add Vitest coverage for notification preference updates
- [x] Run typecheck, tests, and build, then save a final checkpoint for notification preferences

- [x] Create the interactive Lead Search page component matching the reference design layout
- [x] Add Search route registration in App.tsx and sidebar navigation item in Dashboard and ProfileSettings
- [x] Verify Lead Search UI interactions, AI outreach preview, and filter state
- [x] Run typecheck, tests, and build, then save a checkpoint for Lead Search

- [x] Verify Lead Search in an authenticated browser session, including filter toggles, results tabs, selected lead details, and AI outreach preview behavior
- [x] Save a new webdev checkpoint for the Lead Search feature after final verification

- [x] Implement global country typeahead with empty default and full world database
- [x] Implement automatic region/state population based on selected country
- [x] Implement automatic city population based on selected region/state
- [x] Run typecheck, tests, and build, then save a checkpoint for dynamic location filtering

- [x] Expand the world locations dictionary with comprehensive global countries, regions, and cities
- [x] Save a webdev checkpoint for the complete Lead Search and dynamic location filtering update

- [x] Save a webdev checkpoint for the Lead Search and dynamic location filtering update

- [x] Integrate comprehensive global country dataset (including Palestine and all world nations) with typeahead search
- [x] Integrate complete first-level administrative divisions (e.g. all 50+ US states, Palestinian governorates, and global regions)
- [x] Integrate complete dependent cities for each administrative division
- [x] Implement free-text business type input with live autocomplete suggestions
- [x] Run typecheck, tests, and build, then save a checkpoint for comprehensive global location and business search

- [x] Create `CompanyLeadSearch.tsx` as an independent copy of `LeadSearch.tsx`
- [x] Add `/company-lead-search` route in `App.tsx` and sidebar navigation item
- [x] Run typecheck, tests, and build, then save a checkpoint for Company Lead Search

- [x] Add internal `searchMode` foundation: `individual` for Lead Search and `company` for Company Lead Search without changing current behavior
- [x] Validate the two independent search routes and save a checkpoint after the prompt-aligned update

- [x] Add user-entered search count input and relocate Search Leads button to match user screenshot in LeadSearch and CompanyLeadSearch
- [x] Relocate Advanced Filters to the Results section toolbar (next to Export and Columns) in LeadSearch and CompanyLeadSearch
- [x] Bind requested search count to dynamically generate the displayed result count and dataset
- [x] Run typecheck, tests, build, and save checkpoint for the search controls update

- [x] Implement combined result filtering (opportunity tabs + contact/data availability column filters) in LeadSearch and CompanyLeadSearch
- [x] Wire selected rows to CSV export and Use for Outreach actions
- [x] Run typecheck, tests, build, and save checkpoint for combined filtering

- [x] Implement persistent outreach state and navigation to Outreach tab when sending selected filtered leads to outreach

- [x] Add database-backed saved filter views for persistent user filter presets
- [x] Implement immediate auto-filtering for contact data and opportunity tabs with distinct blue/white vs white/black pill styling

- [x] Expand results-row contact filters to all 10 business data types and remove the duplicate red filter row in LeadSearch and CompanyLeadSearch

- [x] Redesign Results section so Saved Filters is compact and contact-data filters are in a dedicated wrapped container below opportunity tabs

- [x] Remove duplicate contact-data columns from the Results table, place Saved Filters in the Website/Email column space, place Export and Columns in the Phone/WhatsApp/Google Profile column space, and add Media Opportunity to opportunity filters in LeadSearch and CompanyLeadSearch

- [x] Move Saved Filters into the former Website/Business Email area and Export/Columns into the former Phone/WhatsApp/Google Profile area in both search pages
- [x] Remove hidden obsolete Saved Filters markup from LeadSearch and CompanyLeadSearch
- [x] Reverify both routes and Media Opportunity filtering after the final control relocation
- [x] Adjust the Results control layout so Saved Filters visibly occupies the former Website/Business Email region and Export/Columns visibly occupies the former Phone/WhatsApp/Google Profile region in both search pages, then capture browser verification of the exact placement.

- [x] Add a consistent Dark/White theme architecture with a user-selectable theme toggle while preserving existing layouts, branding, and functionality
- [x] Verify theme persistence and contrast across public landing, authenticated dashboard, settings, Lead Search, Company Lead Search, and Outreach routes
- [x] Run theme-related tests, typecheck, production build, and save a checkpoint
- [x] Verify White-mode persistence and contrast on Company Lead Search after navigating from another route
- [x] Verify Dark/White theme switching and readable contrast on the Outreach queue route
- [x] Verify White-mode persistence on Company Lead Search by navigating from a White-mode route
- [x] Toggle theme between Dark and White on Outreach and verify contrast in both modes
- [x] Record console theme state and surface color for both Dark and White modes on /outreach
- [x] Capture distinct Dark and White state readings via console on /outreach
- [x] Capture explicit console readings for both White and Dark modes on /outreach

- [x] Audit Company Lead Search against PROMPT 1 requirements (added professional header block, verified `searchMode = "company"`, sidebar position, and shared search foundation)
- [x] Document PROMPT 1 compliance checklist against current implementation
- [x] Run test suite, typecheck, and build to verify audit changes

- [x] Add explanatory tooltips to advanced social-media filters without changing the approved filter layout
- [x] Add Company Lead Search employee-count and annual-revenue filter state, controls, and combined filtering
- [x] Verify Company Lead Search and Individual Lead Search behavior, then run tests and save a checkpoint
- [x] Keep the Company Lead Search selected lead and detail panel synchronized with the filtered result set
- [x] Browser-verify annual-revenue filtering and its combined behavior
- [x] Save a new checkpoint after the tooltip and company-filter fixes
- [x] Verify annual revenue combined with an opportunity tab and a contact-data filter in Company Lead Search
- [x] Save a fresh checkpoint after combined-filter verification

- [x] Add parent company metadata, branch rollups, and headquarters contact properties to Company Lead Search data model
- [x] Update Company Lead Search detail view to display parent company hierarchy and managed branches
- [x] Add Vitest tests for company entity rollup and branch linking
- [x] Save checkpoint and verify parent-company outreach flow
- [x] Send a Company Lead Search parent-company result to Outreach in the browser and verify parent company, parent contact, and branch count display correctly
- [x] Save a fresh checkpoint after the parent-company outreach flow is verified end to end

- [x] Add entity type filter (Parent Company vs Branch) in Company Lead Search
- [x] Implement dynamic hierarchy detection and rollup for multi-location groups
- [x] Add AI email generation endpoint and UI workflow for parent-company outreach
- [x] Add Vitest tests for entity filtering, hierarchy detection, and AI email generation
- [x] Run typecheck, tests, build, and save checkpoint for the company search expansion
- [ ] Implement and browser-verify true Parent Company vs Branch filtering behavior in Company Lead Search
- [ ] Replace hardcoded hierarchy grouping with dynamic parent-company detection/linking logic and add tests
- [ ] Complete parent-company AI outreach UI with loading and error states, and verify in browser
- [ ] Add Vitest coverage for entity-type filtering and the `/api/ai/generate-outreach` endpoint
- [ ] Save a fresh checkpoint after all expansion requirements are verified
