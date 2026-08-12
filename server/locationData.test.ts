import { describe, expect, it } from "vitest";
import { listLocationCities, listLocationCountries, listLocationStates } from "./locationData";

describe("location data", () => {
  it("returns a complete country list with Palestine included", async () => {
    const countries = await listLocationCountries();
    expect(countries.length).toBeGreaterThanOrEqual(200);
    expect(countries.find((country) => country.code === "PS")?.name).toBe("Palestine");
  });

  it("returns all US first-level states and territories", async () => {
    const states = await listLocationStates("US");
    expect(states.find((state) => state.name === "California")).toBeTruthy();
    expect(states.length).toBeGreaterThanOrEqual(50);
  });

  it("returns cities for a selected state", async () => {
    const cities = await listLocationCities("US", "CA");
    expect(cities.some((city) => city.name === "Los Angeles")).toBe(true);
  });
});
