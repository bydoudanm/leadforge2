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
