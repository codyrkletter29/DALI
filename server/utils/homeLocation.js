const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const STATE_CENTROIDS = {
  NH: { lat: 43.1939, lng: -71.5724 },
  MA: { lat: 42.4072, lng: -71.3824 },
  CA: { lat: 36.7783, lng: -119.4179 },
  NY: { lat: 43.0, lng: -75.0 },
  VT: { lat: 44.0, lng: -72.7 },
  CT: { lat: 41.6, lng: -72.7 },
  NJ: { lat: 40.1, lng: -74.7 },
  PA: { lat: 41.0, lng: -77.5 },
  TX: { lat: 31.0, lng: -100.0 },
  FL: { lat: 28.0, lng: -82.0 },
  IL: { lat: 40.0, lng: -89.0 },
  WA: { lat: 47.4, lng: -120.7 },
  OR: { lat: 44.0, lng: -120.6 },
};

const STATE_TO_ABBR = {
  alabama: "AL",
  alaska: "AK",
  arizona: "AZ",
  arkansas: "AR",
  california: "CA",
  colorado: "CO",
  connecticut: "CT",
  delaware: "DE",
  florida: "FL",
  georgia: "GA",
  hawaii: "HI",
  idaho: "ID",
  illinois: "IL",
  indiana: "IN",
  iowa: "IA",
  kansas: "KS",
  kentucky: "KY",
  louisiana: "LA",
  maine: "ME",
  maryland: "MD",
  massachusetts: "MA",
  michigan: "MI",
  minnesota: "MN",
  mississippi: "MS",
  missouri: "MO",
  montana: "MT",
  nebraska: "NE",
  nevada: "NV",
  "new hampshire": "NH",
  "new jersey": "NJ",
  "new mexico": "NM",
  "new york": "NY",
  "north carolina": "NC",
  "north dakota": "ND",
  ohio: "OH",
  oklahoma: "OK",
  oregon: "OR",
  pennsylvania: "PA",
  "rhode island": "RI",
  "south carolina": "SC",
  "south dakota": "SD",
  tennessee: "TN",
  texas: "TX",
  utah: "UT",
  vermont: "VT",
  virginia: "VA",
  washington: "WA",
  "west virginia": "WV",
  wisconsin: "WI",
  wyoming: "WY",
  "district of columbia": "DC",
};

function normalizeCity(cityRaw) {
  if (!cityRaw) return null;
  return cityRaw
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^[“”"']|[“”"']$/g, "");
}

function normalizeState(stateRaw) {
  if (!stateRaw) return null;
  const s = stateRaw.trim().toLowerCase().replace(/\./g, "");
  if (s.length === 2) return s.toUpperCase();
  return STATE_TO_ABBR[s] || null;
}

function parseHome(rawHome) {
  if (!rawHome) return null;

  let cleaned = rawHome
    .trim()
    .replace(/\bUSA\b/i, "")
    .replace(/\bUnited States\b/i, "")
    .replace(/\s+/g, " ")
    .replace(/,\s*,/g, ",")
    .trim();

  if (cleaned.includes(",")) {
    const parts = cleaned
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    const city = normalizeCity(parts[0]);
    const state = normalizeState(parts[1]);
    if (city && state) return { city, state };
  }

  const tokens = cleaned.split(" ").filter(Boolean);
  if (tokens.length >= 2) {
    const maybeState = tokens[tokens.length - 1];
    const state = normalizeState(maybeState);
    if (state) {
      const city = normalizeCity(tokens.slice(0, -1).join(" "));
      if (city) return { city, state };
    }
  }

  return null;
}

function cityStateKey(city, state) {
  return `${city.toLowerCase()},${state.toLowerCase()}`;
}

let cityLookupPromise;

function loadCityLookup(csvPath) {
  return new Promise((resolve, reject) => {
    const map = new Map();

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on("data", (row) => {
        const cityRaw = (row.city || row.City || "").trim();
        const stateRaw = (row.state_id || row.state || row.State || "").trim();

        const city = normalizeCity(cityRaw);
        const state = normalizeState(stateRaw);

        const lat = parseFloat(row.lat ?? row.latitude ?? row.Lat ?? row.Latitude);
        const lng = parseFloat(row.lng ?? row.longitude ?? row.Lng ?? row.Longitude);

        if (!city || !state || Number.isNaN(lat) || Number.isNaN(lng)) return;

        map.set(cityStateKey(city, state), { lat, lng });
      })
      .on("end", () => resolve(map))
      .on("error", reject);
  });
}

async function getCityLookup() {
  if (!cityLookupPromise) {
    const csvPath = path.join(__dirname, "../data/uscities.csv");
    cityLookupPromise = fs.existsSync(csvPath)
      ? loadCityLookup(csvPath)
      : Promise.resolve(new Map());
  }
  return cityLookupPromise;
}

function fallbackStateCentroid(state) {
  return STATE_CENTROIDS[state] || null;
}

async function resolveHomeLocation(rawHome) {
  const homeLocation = {
    raw: rawHome ?? null,
    city: null,
    state: null,
    lat: null,
    lng: null,
    source: "none",
  };

  const parsed = parseHome(rawHome);
  if (!parsed) return homeLocation;

  homeLocation.city = parsed.city;
  homeLocation.state = parsed.state;

  const lookup = await getCityLookup();
  const coords = lookup.get(cityStateKey(parsed.city, parsed.state));
  if (coords) {
    homeLocation.lat = coords.lat;
    homeLocation.lng = coords.lng;
    homeLocation.source = "uscities_csv";
    return homeLocation;
  }

  const centroid = fallbackStateCentroid(parsed.state);
  if (centroid) {
    homeLocation.lat = centroid.lat;
    homeLocation.lng = centroid.lng;
    homeLocation.source = "state_centroid_fallback";
  }

  return homeLocation;
}

module.exports = {
  resolveHomeLocation,
};
