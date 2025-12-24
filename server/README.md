# DALI Social Backend

Node.js/Express backend for the DALI Social application. This service handles authentication, member profiles, posts, stats, and map data backed by MongoDB.

## Features

- 🔐 **Authentication** — Email/password signup/login with bcrypt hashing
- 🔗 **Member Linking** — Signup auto-links to existing members by name or creates a new member profile
- 📝 **Posts** — Create, read, like, and delete posts
- 👥 **Members** — Query members, fetch a member, and find similar profiles
- 📊 **Stats** — Role, major, and class-year aggregates
- 🎂 **Birthdays** — Upcoming birthdays within a configurable window
- 🗺️ **Map Data** — Map-friendly hometown points + state counts
- 🗄️ **MongoDB** — Mongoose models + seed script for member data

## Architecture

```
server/
├── config/               # MongoDB connection
├── data/                 # Seed inputs (members JSON + uscities CSV)
├── models/               # Mongoose schemas
├── routes/               # Express route handlers
├── scripts/              # Seed script
├── index.js              # App entry point
└── package.json
```

## Quick Start

### Prerequisites

- Node.js 16+
- npm
- MongoDB (Atlas or local)

### Installation

```bash
# From the server directory
npm install
```

### Environment Variables

Create a `.env` file in `server/`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dali_social_media
PORT=4000
```

If `MONGODB_URI` is not set, the app defaults to `mongodb://localhost:27017/dali-social`.

### Seed the Members Collection

The seed script loads member profiles and geocodes hometown data from CSV.

```bash
npm run seed
```

**Seed inputs:**
- `data/dali_social_media.json` — base member data
- `data/uscities.csv` — city/state lat/lng lookup

**Notes:**
- The script **clears** the existing `members` collection before inserting.
- It attempts to parse `home` into `{ city, state }` and attaches `homeLocation` with lat/lng.

### Run the Server

```bash
npm run dev
```

Server defaults to `http://localhost:4000`.

## Authentication & Member Linking

Signup auto-links users to existing members by **case-insensitive, exact name match**. If no member is found, a new member profile is created from the signup payload.

### Signup Flow

```
Request → validate → check email → hash password
        → find member by name
            ↳ existing: link
            ↳ missing: create new member
        → create user → return user + member
```

### Example Signup

```json
POST /api/auth/signup
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Jane Doe",
  "year": "2025",
  "major": "Computer Science",
  "minor": "Mathematics",
  "birthday": "05-20",
  "home": "Boston, MA",
  "quote": "Make it happen",
  "picture": "https://example.com/pic.jpg",
  "roles": {
    "dev": true,
    "des": false,
    "pm": false,
    "core": false,
    "mentor": false
  },
  "favorites": {
    "thing1": "Coffee",
    "thing2": "Books",
    "thing3": "Code",
    "dartmouthTradition": "Winter Carnival"
  },
  "funFact": "I can juggle"
}
```

## API Endpoints

Base URL: `http://localhost:4000`

### Health

- `GET /api/health` → `{ ok: true, message: "Server is running" }`

### Auth

- `POST /api/auth/signup`
  - Required: `email`, `password`, `name`
  - Optional: member fields (see **Member Fields**)
- `POST /api/auth/login`
  - Required: `email`, `password`
- `POST /api/auth/logout` (client-side logout helper)

### Posts

- `GET /api/posts` — list posts (newest first)
- `GET /api/posts/:id` — fetch one post
- `POST /api/posts`
  - Required: `content`, `author`, `authorName`
  - `author` should be a **User** `_id`
- `PUT /api/posts/:id/like`
  - Body: `{ "userId": "<user_id>" }`
  - Toggles like for the given user
- `DELETE /api/posts/:id`
  - Body: `{ "userId": "<user_id>" }` (required if post has an author)

### Members

- `GET /api/members?search=<name>&dev=true`
  - `search` performs case-insensitive name match
  - `dev=true` filters to members with `roles.dev = true`
- `GET /api/members/:id`
- `GET /api/members/:id/similar?limit=5`
  - Returns ranked members with matching major/minor/year/roles/state

### Stats

- `GET /api/stats/roles` — counts for each role + total
- `GET /api/stats/majors` — counts by major
- `GET /api/stats/class-years` — counts by class year
- `GET /api/stats/home-states?role=dev&year=2024`
  - Returns counts of members by `homeLocation.state`

### Birthdays

- `GET /api/birthdays/upcoming?days=30`
  - Returns members with birthdays in the next N days (max 365)

### Map

- `GET /api/map/hometowns?role=dev&year=2024&hasCoords=true&limit=500`
  - Returns map points with member + hometown coordinates

## Member Fields

Member profile shape (stored in MongoDB):

| Field | Type | Description |
|------|------|-------------|
| `name` | String | Required full name |
| `email` | String | Optional email (unique if present) |
| `year` | String | Class year (`2024`–`2027`) |
| `major` | String | Major |
| `minor` | String | Minor |
| `birthday` | String | `MM-DD` |
| `homeLocation` | Object | Parsed `{ raw, city, state, lat, lng, source }` |
| `quote` | String | Quote |
| `picture` | String | Profile image URL |
| `roles` | Object | `dev`, `des`, `pm`, `core`, `mentor` |
| `favorites` | Object | `thing1`, `thing2`, `thing3`, `dartmouthTradition` |
| `funFact` | String | Fun fact |

`homeLocation.source` is one of `uscities_csv`, `state_centroid_fallback`, or `none` depending on how the seed script resolved coordinates.

## Database Schema (Mongoose)

### Users

```js
{
  email: String,
  password: String,
  name: String,
  member: ObjectId, // ref Member
  role: "user" | "admin",
  createdAt: Date,
  updatedAt: Date
}
```

### Members

```js
{
  name: String,
  email: String,
  year: "2024" | "2025" | "2026" | "2027",
  major: String,
  minor: String,
  roles: { dev, des, pm, core, mentor },
  birthday: String,
  homeLocation: { raw, city, state, lat, lng, source },
  quote: String,
  favorites: { thing1, thing2, thing3, dartmouthTradition },
  funFact: String,
  picture: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Posts

```js
{
  content: String,
  author: ObjectId, // Member id (routes currently pass User ids)
  authorName: String,
  likes: {
    count: Number,
    users: [ObjectId] // member ids (routes currently pass User ids)
  },
  comments: [
    {
      author: ObjectId, // member id (routes currently pass User ids)
      authorName: String,
      content: String,
      createdAt: Date
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

## Key Dependencies

| Package | Purpose |
|---------|---------|
| express | HTTP server |
| mongoose | MongoDB ODM |
| bcrypt | Password hashing |
| cors | CORS middleware |
| dotenv | Environment variables |
| csv-parser | Seed CSV parsing |

## Troubleshooting

- **MongoDB connection fails**: ensure `MONGODB_URI` is set and reachable.
- **Seed errors**: verify `data/dali_social_media.json` and `data/uscities.csv` exist.
- **404 on API routes**: confirm server is running and using the right base URL (`/api`).

## Contributing

When you add or change endpoints:

1. Update `routes/` and `models/`.
2. Keep this README in sync with route behavior and request/response shapes.
3. Add any new env vars to the **Environment Variables** section.

## License

ISC
