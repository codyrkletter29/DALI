# DALI Social Backend

A Node.js/Express backend for DALI Social, a social networking platform for DALI lab members with integrated member profile management and authentication.

## Features

- 🔐 **Secure Authentication** - Email/password signup and login with bcrypt hashing
- 🔗 **Automatic Member Linking** - Users automatically linked to existing member profiles or new profiles created
- 📝 **Social Posts** - Create, read, update, delete posts with like functionality
- 👥 **Member Profiles** - Rich member profiles with roles, majors, pictures, quotes, and more
- 🗄️ **MongoDB Integration** - Persistent data storage with Mongoose ODM
- 🌐 **CORS Enabled** - Ready for frontend integration

## Architecture

```
DALI Social Backend
├── Authentication System
│   ├── User Model (email, password, name, member reference)
│   └── Auth Routes (signup, login, logout)
├── Member System
│   ├── Member Model (profile data, roles, favorites, etc.)
│   ├── Member seeding from JSON dataset
│   └── Auto-linking on signup
├── Post System
│   ├── Post Model (content, author, likes, comments)
│   └── Post Routes (CRUD + like/unlike)
└── Database
    └── MongoDB Atlas (cloud-hosted)
```

## Quick Start

### Prerequisites

- Node.js 16+
- npm
- MongoDB Atlas account (or local MongoDB)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Create .env file with:
#    MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
#    PORT=4000

# 3. Seed member database (one-time)
npm run seed

# 4. Start development server
npm run dev

# Server will run at http://localhost:4000
```

## How Member Linking Works

The system automatically links user accounts to member profiles through intelligent name matching:

### Signup Flow

```
User submits: { email, password, name, [optional member fields] }
    ↓
[1] Check if email already registered
    ↓
[2] Search for existing member by name (case-insensitive)
    ├─ FOUND: Link user to existing member
    └─ NOT FOUND: Create new member with provided data
    ↓
[3] Hash password with bcrypt
    ↓
[4] Create user document with member reference
    ↓
[5] Return user + member profile data
```

### Examples

**Example 1: Signup with existing member name**
```json
POST /api/auth/signup
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Cody Kletter"
}

// Response: User linked to existing "Cody Kletter" member profile
// Returns: All existing member data (picture, major, year, roles, etc.)
```

**Example 2: Signup with new name (creates new profile)**
```json
POST /api/auth/signup
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "Jane Doe"
}

// Response: New member profile created with defaults
// Returns: Basic profile with roles=all false, favorites=empty
```

**Example 3: Signup with complete member data**
```json
POST /api/auth/signup
{
  "email": "user@example.com",
  "password": "password123",
  "name": "New Person",
  "year": "2025",
  "major": "Computer Science",
  "minor": "Mathematics",
  "birthday": "05-20",
  "home": "New York, NY",
  "quote": "Carpe Diem",
  "picture": "https://example.com/pic.jpg",
  "roles": {
    "dev": true,
    "des": false,
    "pm": true,
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

// Response: New member created with all provided fields
// Returns: Complete profile data
```

## Member Data Fields

When creating a new member profile, the following fields are available:

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `name` | String | Full name (required for lookup) | "Cody Kletter" |
| `email` | String | Email address (unique) | "user@example.com" |
| `year` | String | Class year | "2024", "2025", "2026", "2027" |
| `major` | String | Major field of study | "Computer Science" |
| `minor` | String | Minor field of study | "Mathematics" |
| `birthday` | String | Birthday (MM-DD format) | "05-20" |
| `home` | String | Hometown | "Boston, MA" |
| `quote` | String | Personal quote | "Make it happen" |
| `picture` | String | Profile picture URL | "https://example.com/pic.jpg" |
| `roles` | Object | Role flags | `{dev, des, pm, core, mentor}` |
| `favorites` | Object | Favorite things | `{thing1, thing2, thing3, dartmouthTradition}` |
| `funFact` | String | Fun fact about the person | "I speak 3 languages" |

**Roles Object:**
```json
{
  "dev": boolean,    // Developer
  "des": boolean,    // Designer
  "pm": boolean,     // Product Manager
  "core": boolean,   // Core team
  "mentor": boolean  // Mentor
}
```

**Favorites Object:**
```json
{
  "thing1": string,              // Favorite thing 1
  "thing2": string,              // Favorite thing 2
  "thing3": string,              // Favorite thing 3
  "dartmouthTradition": string   // Favorite Dartmouth tradition
}
```

## API Endpoints

### Authentication

#### POST `/api/auth/signup`
Create a new user account and optionally provide member profile data.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Full Name",
  "year": "2025",
  "major": "Computer Science",
  "minor": "Mathematics",
  "birthday": "05-20",
  "home": "Boston, MA",
  "quote": "Make it happen",
  "picture": "https://example.com/pic.jpg",
  "roles": {"dev": true, "des": false, "pm": true, "core": false, "mentor": false},
  "favorites": {"thing1": "Coffee", "thing2": "Books", "thing3": "Code", "dartmouthTradition": "Winter Carnival"},
  "funFact": "I can juggle"
}
```

**Required:** `email`, `password`, `name`  
**Optional:** All member fields (year, major, minor, etc.)

**Response (201 Created):**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "Full Name",
    "member": {
      "id": "member_id",
      "name": "Full Name",
      "year": "2025",
      "major": "Computer Science",
      "minor": "Mathematics",
      "birthday": "05-20",
      "home": "Boston, MA",
      "quote": "Make it happen",
      "picture": "https://example.com/pic.jpg",
      "roles": {"dev": true, "des": false, "pm": true, "core": false, "mentor": false},
      "favorites": {"thing1": "Coffee", "thing2": "Books", "thing3": "Code", "dartmouthTradition": "Winter Carnival"},
      "funFact": "I can juggle"
    }
  }
}
```

**Errors:**
- `400` - Missing required fields or password < 6 characters
- `409` - Email already registered

---

#### POST `/api/auth/login`
Authenticate user and retrieve member profile data.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "Full Name",
    "member": {
      "id": "member_id",
      "name": "Full Name",
      "year": "2025",
      "major": "Computer Science",
      "picture": "https://example.com/pic.jpg",
      "roles": {"dev": true, "des": false, "pm": true, "core": false, "mentor": false},
      ...
    }
  }
}
```

**Errors:**
- `400` - Missing email or password
- `401` - Invalid credentials

---

#### POST `/api/auth/logout`
Client-side logout (clears authentication state on frontend).

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out"
}
```

---

### Posts

#### POST `/api/posts`
Create a new post.

**Request:**
```json
{
  "content": "This is my post",
  "userId": "user_id",
  "authorName": "Full Name"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "post": {
    "_id": "post_id",
    "content": "This is my post",
    "author": "user_id",
    "authorName": "Full Name",
    "likes": {
      "count": 0,
      "users": []
    },
    "comments": [],
    "createdAt": "2025-12-20T12:34:56.789Z",
    "updatedAt": "2025-12-20T12:34:56.789Z"
  }
}
```

---

#### GET `/api/posts`
Retrieve all posts (newest first).

**Response (200 OK):**
```json
{
  "success": true,
  "posts": [
    {
      "_id": "post_id",
      "content": "Post content",
      "author": "user_id",
      "authorName": "Author Name",
      "likes": {"count": 5, "users": ["user_id_1", "user_id_2", ...]},
      "comments": [],
      "createdAt": "2025-12-20T12:34:56.789Z"
    }
  ]
}
```

---

#### PUT `/api/posts/:id/like`
Toggle like on a post (like if not liked, unlike if already liked).

**Request:**
```json
{
  "userId": "user_id"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "post": {
    "_id": "post_id",
    "content": "Post content",
    "likes": {
      "count": 5,
      "users": ["user_id", "user_id_2", ...]
    }
  }
}
```

---

#### DELETE `/api/posts/:id`
Delete a post (author only).

**Request:**
```json
{
  "userId": "user_id"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Post deleted"
}
```

**Errors:**
- `403` - Not authorized (not post author)
- `404` - Post not found

---

### Health Check

#### GET `/api/health`
Check if server is running.

**Response (200 OK):**
```json
{
  "status": "Server is running"
}
```

---

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed with bcrypt, required),
  name: String (required),
  member: ObjectId (reference to Member document),
  role: String ("user" | "admin", default: "user"),
  createdAt: Date,
  updatedAt: Date
}
```

### Members Collection
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (unique, sparse),
  year: String (enum: ["2024", "2025", "2026", "2027"]),
  major: String,
  minor: String,
  birthday: String (MM-DD format),
  home: String,
  quote: String,
  picture: String (URL),
  roles: {
    dev: Boolean (default: false),
    des: Boolean (default: false),
    pm: Boolean (default: false),
    core: Boolean (default: false),
    mentor: Boolean (default: false)
  },
  favorites: {
    thing1: String,
    thing2: String,
    thing3: String,
    dartmouthTradition: String
  },
  funFact: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Posts Collection
```javascript
{
  _id: ObjectId,
  content: String (required),
  author: ObjectId (reference to User, required),
  authorName: String,
  likes: {
    count: Number (default: 0),
    users: [ObjectId] (array of user IDs who liked)
  },
  comments: [
    {
      author: String,
      content: String,
      createdAt: Date
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

---

## Testing

### Setup for Testing

```bash
# Start the server
npm run dev

# In another terminal, run tests
```

### Test Cases

#### 1. Signup with Basic Fields
```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email":"user1@example.com",
    "password":"password123",
    "name":"Jane Doe"
  }'
```

#### 2. Signup with Complete Member Data
```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email":"user2@example.com",
    "password":"password123",
    "name":"John Smith",
    "year":"2025",
    "major":"Computer Science",
    "minor":"Mathematics",
    "birthday":"05-20",
    "home":"Boston, MA",
    "quote":"Make it happen",
    "picture":"https://example.com/pic.jpg",
    "roles":{"dev":true,"des":false,"pm":true,"core":false,"mentor":false},
    "favorites":{"thing1":"Coffee","thing2":"Books","thing3":"Code","dartmouthTradition":"Winter Carnival"},
    "funFact":"I can juggle"
  }'
```

#### 3. Signup with Existing Member Name
```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email":"user3@example.com",
    "password":"password123",
    "name":"Cody Kletter"
  }'
```

#### 4. Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"user2@example.com",
    "password":"password123"
  }'
```

#### 5. Create Post
```bash
# Capture user ID from signup/login response
USER_ID="<user_id_from_response>"

curl -X POST http://localhost:4000/api/posts \
  -H "Content-Type: application/json" \
  -d "{
    \"content\":\"This is my post\",
    \"userId\":\"${USER_ID}\",
    \"authorName\":\"John Smith\"
  }"
```

#### 6. Get All Posts
```bash
curl http://localhost:4000/api/posts
```

#### 7. Like Post
```bash
POST_ID="<post_id_from_response>"
USER_ID="<user_id_from_response>"

curl -X PUT http://localhost:4000/api/posts/${POST_ID}/like \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"${USER_ID}\"}"
```

#### 8. Delete Post
```bash
curl -X DELETE http://localhost:4000/api/posts/${POST_ID} \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"${USER_ID}\"}"
```

---

## Seeding Member Database

The `dali_social_media.json` file contains pre-existing member profiles. To load them into MongoDB:

```bash
npm run seed
```

**What it does:**
1. Reads `data/dali_social_media.json`
2. Connects to MongoDB
3. Bulk inserts all members
4. Skips duplicates gracefully
5. Logs success count

**When to run:**
- First time setup (required before testing member linking)
- When `dali_social_media.json` is updated
- After clearing MongoDB collections

**Output:**
```
✓ MongoDB connected successfully
✓ Seeded 26 members into database
```

---

## Environment Variables

Create a `.env` file in the server directory:

```env
# MongoDB Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dali_social_media

# Server Port
PORT=4000
```

### Getting MongoDB Connection String

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create/select a cluster
3. Click "Connect"
4. Choose "Connect your application"
5. Select Node.js driver
6. Copy the connection string
7. Replace `<username>`, `<password>`, and `<cluster>` with your values
8. Add `/dali_social_media` before `?` to specify the database name

---

## Project Structure

```
server/
├── config/
│   └── db.js                 # MongoDB connection setup
├── models/
│   ├── index.js             # Model exports
│   ├── User.js              # User schema & model
│   ├── Member.js            # Member schema & model
│   └── Post.js              # Post schema & model
├── routes/
│   ├── auth.js              # Authentication endpoints
│   └── posts.js             # Post CRUD endpoints
├── scripts/
│   └── seedMembers.js       # Database seeding script
├── data/
│   └── dali_social_media.json  # Member dataset
├── index.js                 # Express app entry point
├── package.json             # Dependencies & scripts
├── .env                     # Environment variables
└── README.md               # This file
```

---

## Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| express | ^5.2.1 | Web framework |
| mongoose | ^9.0.2 | MongoDB ODM |
| bcrypt | ^6.0.0 | Password hashing |
| cors | ^2.8.5 | Cross-origin requests |
| dotenv | ^17.2.3 | Environment variables |

---

## Running in Production

### Deployment Steps

1. **Deploy to hosting (Heroku, Railway, etc.)**
   ```bash
   git push heroku main  # or your deployment command
   ```

2. **Set environment variables on host**
   ```
   MONGODB_URI=mongodb+srv://...
   PORT=4000
   ```

3. **Seed database (one-time)**
   ```bash
   heroku run "npm run seed"  # for Heroku
   ```

4. **Verify deployment**
   ```bash
   curl https://your-backend.com/api/health
   ```

### Production Checklist

- [ ] MONGODB_URI set correctly
- [ ] PORT environment variable set
- [ ] CORS configured for frontend URL
- [ ] Database seeded with `npm run seed`
- [ ] All environment variables set on host
- [ ] HTTPS enabled
- [ ] MongoDB Atlas IP whitelist updated

---

## Troubleshooting

### "Cannot find module" errors

```bash
# Make sure dependencies are installed
npm install
```

### MongoDB connection fails

```bash
# Check MONGODB_URI is correct
cat .env | grep MONGODB_URI

# Test connection
npm run dev
# Should print: "✓ MongoDB connected successfully"
```

### Seed script fails

```bash
# Ensure .env has MONGODB_URI
# Ensure data/dali_social_media.json exists
# Check MongoDB connection first: npm run dev
npm run seed
```

### Member not linking on signup

```bash
# Check exact name spelling in dali_social_media.json
# Name matching is case-insensitive but exact (no fuzzy matching)
# Run seed script first: npm run seed
```

### Duplicate email error on signup

```bash
# Email already exists in Users collection
# Try with different email address
# Or check MongoDB directly
```

### POST requests return 404

```bash
# Make sure server is running on port 4000
curl http://localhost:4000/api/health
# Should return: {"status":"Server is running"}
```

---

## API Response Format

All API responses follow a consistent format:

**Success (2xx):**
```json
{
  "success": true,
  "user": {...},  // or "post", "posts", etc.
  "message": "..."  // optional
}
```

**Error (4xx, 5xx):**
```json
{
  "error": "Error message describing what went wrong"
}
```

---

## Authentication Flow

```
[Frontend]                          [Backend]
    |                                   |
    |------ signup request ----------->|
    |                                   |
    |     Find/create member            |
    |     Hash password                 |
    |     Create user                   |
    |                                   |
    |<---- user + member data ----------|
    |                                   |
    |------ login request ------------->|
    |                                   |
    |     Verify email exists           |
    |     Compare password              |
    |     Populate member data          |
    |                                   |
    |<---- user + member data ---------|
    |                                   |
    | Store in AuthContext/Local Storage|
    | Include in subsequent requests    |
    |                                   |
```

---

## Security Considerations

- ✅ Passwords hashed with bcrypt (10 salt rounds)
- ✅ MongoDB ObjectId prevents SQL injection
- ✅ Email uniqueness prevents duplicate accounts
- ✅ CORS enabled for frontend origin
- ✅ Password minimum 6 characters (increase for production)

**Future improvements:**
- JWT tokens for stateless auth
- Rate limiting on auth endpoints
- Password reset via email
- Email verification on signup
- Refresh tokens for session management

---

## Contributing

When adding new features:

1. Add/update Mongoose models in `models/`
2. Create/update routes in `routes/`
3. Test with curl or Postman
4. Update this README
5. Add environment variables to `.env` if needed

---

## Support

For issues or questions:
1. Check the Troubleshooting section
2. Review API endpoint documentation
3. Check server logs: `npm run dev`
4. Check MongoDB for data: Use MongoDB Compass

---

## License

ISC
