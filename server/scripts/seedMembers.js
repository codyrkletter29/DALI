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
require("dotenv").config();

const { Member } = require("../models");
const connectDB = require("../config/db");
const { resolveHomeLocation } = require("../utils/homeLocation");

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

    const membersData = JSON.parse(fs.readFileSync(membersJsonPath, "utf-8"));
    const normalizedMembers = membersData.map(normalizeMember);

    // Attach homeLocation to each member
    let matched = 0;
    let fallback = 0;
    let missing = 0;

    const enrichedMembers = await Promise.all(
      normalizedMembers.map(async (m) => {
        const homeLocation = await resolveHomeLocation(m.home);

        if (homeLocation.source === "uscities_csv") matched++;
        else if (homeLocation.source === "state_centroid_fallback") fallback++;
        else missing++;

        return { ...m, homeLocation };
      })
    );

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
