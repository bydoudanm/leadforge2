import {
  getCitiesOfState,
  getCountries,
  getStatesOfCountry,
  type ICity,
  type ICountry,
  type IState,
} from "@countrystatecity/countries";

export type LocationCountry = {
  code: string;
  name: string;
  iso3: string;
  emoji: string;
};

export type LocationState = {
  code: string;
  name: string;
  type: string | null;
};

export type LocationCity = {
  id: number;
  name: string;
};

const countriesCache = new Map<string, LocationCountry[]>();
const statesCache = new Map<string, LocationState[]>();
const citiesCache = new Map<string, LocationCity[]>();

function countryName(country: ICountry) {
  return country.iso2 === "PS" ? "Palestine" : country.name;
}

function mapCountry(country: ICountry): LocationCountry {
  return {
    code: country.iso2,
    name: countryName(country),
    iso3: country.iso3,
    emoji: country.emoji,
  };
}

function mapState(state: IState): LocationState {
  return {
    code: state.iso2,
    name: state.name,
    type: state.type,
  };
}

function mapCity(city: ICity): LocationCity {
  return { id: city.id, name: city.name };
}

export async function listLocationCountries() {
  const cached = countriesCache.get("all");
  if (cached) return cached;

  const countries = (await getCountries())
    .map(mapCountry)
    .sort((left, right) => left.name.localeCompare(right.name));
  countriesCache.set("all", countries);
  return countries;
}

export async function listLocationStates(countryCode: string) {
  const normalizedCountryCode = countryCode.trim().toUpperCase();
  const cached = statesCache.get(normalizedCountryCode);
  if (cached) return cached;

  const states = (await getStatesOfCountry(normalizedCountryCode))
    .map(mapState)
    .sort((left, right) => left.name.localeCompare(right.name));
  statesCache.set(normalizedCountryCode, states);
  return states;
}

export async function listLocationCities(countryCode: string, stateCode: string) {
  const normalizedCountryCode = countryCode.trim().toUpperCase();
  const normalizedStateCode = stateCode.trim().toUpperCase();
  const cacheKey = `${normalizedCountryCode}:${normalizedStateCode}`;
  const cached = citiesCache.get(cacheKey);
  if (cached) return cached;

  const cities = (await getCitiesOfState(normalizedCountryCode, normalizedStateCode))
    .map(mapCity)
    .sort((left, right) => left.name.localeCompare(right.name));
  citiesCache.set(cacheKey, cities);
  return cities;
}

export function isIso2Code(value: string) {
  return /^[A-Z]{2}$/i.test(value);
}
