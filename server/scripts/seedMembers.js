/**
 * seedMembers.js
 *
 * Copy-paste ready seed script that:
 * 1) Connects to MongoDB
 * 2) Loads DALI members from JSON
 * 3) Loads US cities CSV (city + state_id + lat + lng)
 * 4) Normalizes each member
 * 5) Parses + normalizes "home" into {city, state}
 * 6) Looks up lat/lng from CSV (falls back to state centroid when available)
 * 7) Inserts into MongoDB
 *
 * Assumptions:
 * - Your Member model supports `homeLocation` field:
 *   homeLocation: { raw, city, state, lat, lng, source }
 *
 * Update the paths below if your file names differ.
 */

const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

require("dotenv").config();

const { Member } = require("../models");
const connectDB = require("../config/db");

// -------------------------
// Helpers
// -------------------------

const toBool = (v) => {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v === 1;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    return ["true", "yes", "y", "1"].includes(s);
  }
  return false;
};

// Optional fallback: state centroids (add more if you want)
// If you don't want fallback, you can remove this section and any usage.
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

function fallbackStateCentroid(state) {
  return STATE_CENTROIDS[state] || null;
}

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

/**
 * Parse raw "home" strings into { city, state }.
 * Supports:
 * - "Lyme, NH"
 * - "Boston, MA"
 * - "Hanover NH"
 * - "New York, NY, USA"
 * - "Los Angeles, California"
 */
function parseHome(rawHome) {
  if (!rawHome) return null;

  let cleaned = rawHome
    .trim()
    .replace(/\bUSA\b/i, "")
    .replace(/\bUnited States\b/i, "")
    .replace(/\s+/g, " ")
    .replace(/,\s*,/g, ",")
    .trim();

  // Comma form: City, State
  if (cleaned.includes(",")) {
    const parts = cleaned.split(",").map((p) => p.trim()).filter(Boolean);
    const city = normalizeCity(parts[0]);
    const state = normalizeState(parts[1]);
    if (city && state) return { city, state };
  }

  // Space form: City ST
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

/**
 * Load city lookup from CSV into Map("city,state" -> {lat,lng})
 * Assumes CSV has columns like:
 * - city, state_id, lat, lng
 * BUT we allow common variants to be safe.
 */
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

// -------------------------
// Member normalization
// -------------------------

const normalizeMember = (m) => {
  return {
    name: m.name,
    email: m.email ?? undefined,
    year: m.year,
    major: m.major,
    minor: m.minor,

    roles: {
      dev: toBool(m.dev ?? m.roles?.dev),
      des: toBool(m.des ?? m.roles?.des),
      pm: toBool(m.pm ?? m.roles?.pm),
      core: toBool(m.core ?? m.roles?.core),
      mentor: toBool(m.mentor ?? m.roles?.mentor),
    },

    birthday: m.birthday,
    home: m.home,
    quote: m.quote,

    favorites: {
      thing1: m["favorite thing 1"] ?? m.favorites?.thing1,
      thing2: m["favorite thing 2"] ?? m.favorites?.thing2,
      thing3: m["favorite thing 3"] ?? m.favorites?.thing3,
      dartmouthTradition:
        m["favorite dartmouth tradition"] ?? m.favorites?.dartmouthTradition,
    },

    funFact: m["fun fact"] ?? m.funFact,
    picture: m.picture,
  };
};

// -------------------------
// Seed
// -------------------------

const seedMembers = async () => {
  try {
    await connectDB();

    // Paths (adjust filenames if needed)
    const membersJsonPath = path.join(__dirname, "../data/dali_social_media.json");
    const citiesCsvPath = path.join(__dirname, "../data/uscities.csv");

    if (!fs.existsSync(membersJsonPath)) {
      throw new Error(`Missing members JSON at: ${membersJsonPath}`);
    }
    if (!fs.existsSync(citiesCsvPath)) {
      throw new Error(
        `Missing cities CSV at: ${citiesCsvPath}\n` +
          `Tip: put your csv in ../data and name it uscities.csv (or update citiesCsvPath).`
      );
    }

    const cityLookup = await loadCityLookup(citiesCsvPath);

    const membersData = JSON.parse(fs.readFileSync(membersJsonPath, "utf-8"));
    const normalizedMembers = membersData.map(normalizeMember);

    // Attach homeLocation to each member
    let matched = 0;
    let fallback = 0;
    let missing = 0;

    const enrichedMembers = normalizedMembers.map((m) => {
      const parsed = parseHome(m.home);

      const homeLocation = {
        raw: m.home ?? null,
        city: null,
        state: null,
        lat: null,
        lng: null,
        source: "none",
      };

      if (!parsed) {
        missing++;
        return { ...m, homeLocation };
      }

      homeLocation.city = parsed.city;
      homeLocation.state = parsed.state;

      const coords = cityLookup.get(cityStateKey(parsed.city, parsed.state));
      if (coords) {
        homeLocation.lat = coords.lat;
        homeLocation.lng = coords.lng;
        homeLocation.source = "uscities_csv";
        matched++;
        return { ...m, homeLocation };
      }

      const centroid = fallbackStateCentroid(parsed.state);
      if (centroid) {
        homeLocation.lat = centroid.lat;
        homeLocation.lng = centroid.lng;
        homeLocation.source = "state_centroid_fallback";
        fallback++;
        return { ...m, homeLocation };
      }

      missing++;
      return { ...m, homeLocation };
    });

    await Member.deleteMany({});
    const inserted = await Member.insertMany(enrichedMembers, { ordered: false });

    console.log(`✓ Seeded ${inserted.length} members into database`);
    console.log(
      `Home geocoding results: matched=${matched}, fallback=${fallback}, missing=${missing}, total=${enrichedMembers.length}`
    );

    // Optional: list a few misses so you can debug your parsing / CSV columns
    const misses = enrichedMembers
      .filter((m) => m.homeLocation?.source === "none")
      .slice(0, 10)
      .map((m) => m.homeLocation?.raw);

    if (misses.length) {
      console.log("First 10 unmatched home values:", misses);
    }

    process.exit(0);
  } catch (error) {
    console.error("✗ Seeding failed:", error);
    process.exit(1);
  }
};

seedMembers();
