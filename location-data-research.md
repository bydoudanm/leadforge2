# Lead Search Location Data Research

The researched `dr5hn/countries-states-cities-database` repository documents a comprehensive dataset published in JSON, SQL, PostgreSQL, SQLite, XML, YAML, and CSV formats. Its README reports 250 countries, 5,299 states/regions/municipalities, and 153,765 cities/towns/districts. The repository states that the data is free under the Open Database License with attribution required. Source: https://github.com/dr5hn/countries-states-cities-database

The `@countrystatecity/countries` npm package was also identified as an official package option, but the npm page was protected by a Cloudflare interstitial during review. The implementation should prefer a complete, locally bundled dataset or a maintained package over a small hand-maintained list.

Implementation requirement: Country must be empty by default and searchable; Palestine must be present; region/state/province options must depend on the selected country; cities must depend on the selected first-level administrative division; business type must be free text with suggestions.
