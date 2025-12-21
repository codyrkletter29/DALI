const express = require("express");
const bcrypt = require("bcrypt");
const { User, Member } = require("../models");

const router = express.Router();

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { email, password, name, year, major, minor, birthday, home, quote, picture, roles, favorites, funFact } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({
        error: "Email, password, and name are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        error: "Email already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Try to find matching member (case-insensitive, exact name match)
    let member = await Member.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
    });

    // If no member found, create a new one with all provided data
    if (!member) {
      member = new Member({
        name,
        email,
        year,
        major,
        minor,
        birthday,
        home,
        quote,
        picture,
        roles: roles || {
          dev: false,
          des: false,
          pm: false,
          core: false,
          mentor: false,
        },
        favorites: favorites || {
          thing1: undefined,
          thing2: undefined,
          thing3: undefined,
          dartmouthTradition: undefined,
        },
        funFact,
      });
      await member.save();
    }

    // Create user linked to member
    const user = new User({
      email,
      password: hashedPassword,
      name,
      member: member._id,
    });

    await user.save();

    // Return user data with member info
    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        member: {
          id: member._id,
          name: member.name,
          major: member.major,
          minor: member.minor,
          year: member.year,
          picture: member.picture,
          roles: member.roles,
          birthday: member.birthday,
          home: member.home,
          quote: member.quote,
          favorites: member.favorites,
          funFact: member.funFact,
        },
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      error: "Signup failed",
    });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({ email }).populate("member");
    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    // Return user data with member info
    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        member: user.member ? {
          id: user.member._id,
          name: user.member.name,
          major: user.member.major,
          minor: user.member.minor,
          year: user.member.year,
          picture: user.member.picture,
          roles: user.member.roles,
          birthday: user.member.birthday,
          home: user.member.home,
          quote: user.member.quote,
          favorites: user.member.favorites,
          funFact: user.member.funFact,
        } : null,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Login failed",
    });
  }
});

// POST /api/auth/logout (client-side, server can clear tokens if needed)
router.post("/logout", (req, res) => {
  res.json({
    success: true,
    message: "Logged out",
  });
});

module.exports = router;
