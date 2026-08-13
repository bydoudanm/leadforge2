# Business Type Browser Verification

- Route: `/lead-search`
- The Business Type field is a free-text input with placeholder `Type a business (e.g. Plumber)…`.
- Entering `ai automation agencies` displays a dropdown labeled `Suggested match · AI assistance only`.
- For that niche query, the UI shows `Use exactly what I typed: ai automation agencies`, confirming no fixed-category restriction.
- The result page continues to expose the opportunity and contact-data filters, search count, saved filters, outreach, export, and columns controls.
- Browser console output still displayed an earlier stale Vite parse error reference for `CompanyLeadSearch.tsx` at line 958, while current `pnpm check`, `pnpm test`, and `pnpm build` all pass; verify Company Lead Search after the dev server refresh.

- Route: `/company-lead-search`
- The same free-text Business Type input and `Suggested match · AI assistance only` dropdown are present.
- Entering `ai automation agencies` shows `Use exactly what I typed: ai automation agencies` while preserving Company Profile Filters for entity type, employees, and annual revenue.
- Parent-company rollup results and outreach/export controls remain visible alongside the updated query UI.

- After restarting the dev server, Lead Search was reopened and `ai automation agencies` produced both `AI Automation Agency` with `AI Automation Agencies` semantic text and `Use exactly what I typed: ai automation agencies`.
- The prior stale CompanyLeadSearch parser message did not recur in the refreshed preview; TypeScript, tests, build, and server health are clean.

- Clicking `Use exactly what I typed` closes the suggestion menu while retaining `ai automation agencies` in the Business Type input.

- With `ai automation agencies` retained in the Business Type field and a target count of `5`, clicking Search Leads displayed `5 businesses found (showing 5 preview rows)` and changed the results tab to `All (5)`.
- Existing opportunity, contact-data, saved-filter, outreach, export, and column controls remained available after search execution.

- On refreshed Individual Lead Search, typing `restaurant` presents both `Restaurant · Restaurant Businesses` and `Use exactly what I typed: restaurant`.
- The preview table already reflects only Restaurant rows while the query is active, demonstrating that Business Type now participates in derived result filtering before the Search Leads count is submitted.

- Choosing the Restaurant suggestion, setting the target count to `5`, and clicking Search Leads produced `5 businesses found (showing 5 preview rows)` and `All (5)`, with every visible row categorized as Restaurant.

- On Company Lead Search, typing `restaurant` presents the same semantic suggestion and exact-query option, and the company results immediately narrow to two Restaurant parent-company rows while preserving managed-branch counts.

- Choosing the Restaurant suggestion on Company Lead Search preserved the two matching parent-company rows and their branch rollups before the counted Search Leads action.

- After setting the Company Lead Search target count to `5` and clicking Search Leads, the page retained the two matching Restaurant parent-company rows with their branch counts; Company Lead Search preserves hierarchy rollups while applying Business Type filtering.

- Final browser verification on Individual Lead Search: typing `ai automation agencies` shows the semantic suggestion `AI Automation Agency · AI Automation Agencies` and the explicit `Use exactly what I typed` option. With the exact phrase active, the result table is empty and the page displays `No businesses match ai automation agencies with the current opportunity and contact filters.` No unrelated lead detail panel is shown.

- Final browser verification on Company Lead Search: typing `ai automation agencies` shows the semantic `AI Automation Agency` suggestion and the explicit exact-query option. The exact phrase produces an empty company table and the message `No companies match ai automation agencies with the current company, opportunity, and contact filters.`

- Final counted Company Lead Search verification: after selecting the Restaurant semantic suggestion, committing target count `5` through the form field, and invoking Search Leads, the Results banner reads `2 businesses found (showing 2 preview rows)` and the All tab reads `All (2)`. Both rows are Restaurant parent-company rollups, preserving the 4-branch and 1-branch hierarchy details.
