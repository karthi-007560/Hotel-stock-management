
const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function makeToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in .env");
  }

  return jwt.sign(
    { id: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
}

function safeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  };
}

// Verify logged-in user and current database role
async function requireAdmin(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ")
      ? header.slice(7)
      : "";

    if (!token) {
      return res.status(401).json({
        message: "Please login first."
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await User.findById(decoded.id);

    if (!admin || admin.active !== true || admin.role !== "admin") {
      return res.status(403).json({
        message: "Admin permission required."
      });
    }

    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid or expired login session."
    });
  }
}

// Public signup: Shopkeeper only
router.post("/signup", async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required."
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters."
      });
    }

    // Never accept admin/manager roles from public signup.
    if (
      req.body?.role &&
      req.body.role !== "storekeeper"
    ) {
      return res.status(403).json({
        message: "Admin or Manager accounts must be created by an Admin."
      });
    }

    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(409).json({
        message: "An account with this email already exists."
      });
    }

    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 12),
      role: "storekeeper",
      active: true
    });

    return res.status(201).json({
      message: "Shopkeeper account created. Please login.",
      user: safeUser(user)
    });
  } catch (err) {
    console.error("Signup error:", err.message);

    return res.status(err.code === 11000 ? 409 : 500).json({
      message: err.code === 11000
        ? "An account with this email already exists."
        : "Signup failed. Check the backend terminal."
    });
  }
});

// First admin setup: allowed only when no users exist
router.post("/setup-admin", async (req, res) => {
  try {
    if (
      !process.env.SETUP_KEY ||
      req.body?.setupKey !== process.env.SETUP_KEY
    ) {
      return res.status(403).json({
        message: "Setup denied."
      });
    }

    // Atomic creation prevents simultaneous first-admin setup requests.
    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");

    if (!name || !email || password.length < 8) {
      return res.status(400).json({
        message: "Name, email and password (minimum 8 characters) are required."
      });
    }

    if (await User.exists({})) {
      return res.status(409).json({
        message: "An account already exists. Ask an Admin to manage users."
      });
    }

    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 12),
      role: "admin",
      active: true
    });

    return res.status(201).json({
      message: "Admin created successfully.",
      token: makeToken(user),
      user: safeUser(user)
    });
  } catch (err) {
    console.error("Admin setup error:", err.message);

    return res.status(err.code === 11000 ? 409 : 500).json({
      message: err.code === 11000
        ? "An account with this email already exists."
        : "Could not create admin."
    });
  }
});

// Admin-only: create Manager or Shopkeeper accounts
router.post("/create-user", requireAdmin, async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    const role = String(req.body?.role || "");

    if (!name || !email || password.length < 8) {
      return res.status(400).json({
        message: "Name, email and password (minimum 8 characters) are required."
      });
    }

    if (!["manager", "storekeeper"].includes(role)) {
      return res.status(400).json({
        message: "Choose Manager or Shopkeeper. Admin cannot be assigned here."
      });
    }

    if (await User.exists({ email })) {
      return res.status(409).json({
        message: "An account with this email already exists."
      });
    }

    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 12),
      role,
      active: true
    });

    return res.status(201).json({
      message: `${role === "manager" ? "Manager" : "Shopkeeper"} account created successfully.`,
      user: safeUser(user)
    });
  } catch (err) {
    console.error("Create user error:", err.message);

    return res.status(err.code === 11000 ? 409 : 500).json({
      message: err.code === 11000
        ? "An account with this email already exists."
        : "Could not create user."
    });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required."
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (
      !user ||
      user.active !== true ||
      !(await bcrypt.compare(password, user.password))
    ) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    return res.json({
      message: "Login successful.",
      token: makeToken(user),
      user: safeUser(user)
    });
  } catch (err) {
    console.error("Login error:", err.message);

    return res.status(500).json({
      message: "Login failed. Check the backend terminal."
    });
  }
});

module.exports = router;
