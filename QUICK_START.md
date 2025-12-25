# Quick Start: Member Linking System

## 🚀 First Time Setup

### 1. Start MongoDB + Backend
```bash
cd server

# Install dependencies (first time only)
npm install

# Load member data from JSON into MongoDB
npm run seed

# Start backend server
npm run dev
```

You should see:
```
✓ MongoDB connected successfully
✓ Seeded 40+ members into database
Server running on port 4000
```

### 2. Start Frontend
```bash
cd client

# Install dependencies (first time only)
npm install

# Start dev server
npm run dev
```

### 3. Test the Feature
Go to http://localhost:5173

#### Test Case 1: Existing Member
1. Click **Sign Up**
2. Enter:
   - Email: `existing@example.com`
   - Name: `Cody Kletter` (or any name in dali_social_media.json)
   - Password: `password123`
3. **Expected:** Sign up succeeds, member profile auto-linked

#### Test Case 2: New Member
1. Click **Sign Up**
2. Enter:
   - Email: `newperson@example.com`
   - Name: `Jane Doe` (new name not in dataset)
   - Password: `password123`
3. **Expected:** Sign up succeeds, new member profile created automatically

#### Test Case 3: Login
1. Click **Log In**
2. Use email/password from above
3. **Expected:** Login works, shows member data if linked

## 📋 What Happens Behind the Scenes

### Signup with Existing Member
```
User enters name "Cody Kletter"
    ↓
Backend searches Member collection: name = "Cody Kletter"
    ↓
FOUND: member_id = 123
    ↓
Create User with member: member_id = 123
    ↓
Return: user + member data (picture, major, roles, etc.)
    ↓
Frontend stores user.member = { name, major, picture, ... }
```

### Signup with New Name
```
User enters name "Jane Doe"
    ↓
Backend searches Member collection: name = "Jane Doe"
    ↓
NOT FOUND
    ↓
Create new Member: { name: "Jane Doe", email: "..." }
    ↓
Create User with member: member_id = new_member_id
    ↓
Return: user + member data (empty major/picture/roles)
    ↓
Frontend stores user.member with available data
```

## 🔧 Troubleshooting

### Backend won't start
```bash
# Check if port 4000 is already in use
lsof -i :4000
# Kill the process if needed
kill -9 <PID>
```

### Seed script fails
```bash
# Make sure MongoDB URI is in server/.env
cat server/.env | grep MONGODB_URI

# Check MongoDB connection
npm run dev
# Should print "✓ MongoDB connected successfully"
```

### Frontend can't reach backend
1. Make sure backend is running on port 4000
2. Check `VITE_API_BASE` in AuthContext.jsx
3. Try manually: `curl http://localhost:4000/api/health`

### Member data not showing
1. First signup as **existing member** (e.g., "Cody Kletter")
2. Check MongoDB: `db.members.findOne({ name: "Cody Kletter" })`
3. If empty, member wasn't seeded - run `npm run seed` again

## 📂 Files Modified/Created

### Created:
- `server/scripts/seedMembers.js` - Loads JSON into MongoDB
- `MEMBER_LINKING_SETUP.md` - Full setup guide

### Updated:
- `server/routes/auth.js` - Member linking + creation logic
- `server/package.json` - Added `npm run seed` command
- `server/models/User.js` - Added member ObjectId reference

### No Changes Needed:
- `client/src/context/AuthContext.jsx` - Already handles member data
- `server/models/Member.js` - Correct schema
- `server/models/Post.js` - Unchanged

## 🌐 Production Deployment

### For Netlify Frontend + Heroku Backend:

1. **Backend (Heroku):**
   ```bash
   git push heroku main
   heroku run "npm run seed"  # One-time setup
   ```

2. **Frontend (Netlify):**
   ```bash
   Set environment variable:
   VITE_API_BASE = https://your-backend.herokuapp.com
   ```

3. **Trigger redeployment:**
   ```bash
   git push origin main
   ```

## ✅ Success Indicators

After setup, you should see:

1. **Signup with existing member:**
   ```json
   {
     "success": true,
     "user": {
       "name": "Cody Kletter",
       "member": {
         "name": "Cody Kletter",
         "major": "Computer Science",
         "picture": "..."
       }
     }
   }
   ```

2. **Signup with new name:**
   ```json
   {
     "success": true,
     "user": {
       "name": "Jane Doe",
       "member": {
         "name": "Jane Doe",
         "major": null,
         "picture": null
       }
     }
   }
   ```

3. **Member collection populated:**
   - MongoDB: `db.members.countDocuments()` returns 40+

Done! 🎉
