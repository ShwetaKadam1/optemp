import admin from "firebase-admin";
import User from "../models/User.js";

let initialized = false;
const initFirebase = () => {
  if (initialized) return;
  if (!admin.apps.length) {
    const path = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (raw) {
      admin.initializeApp({ credential: admin.credential.cert(JSON.parse(raw)) });
    } else if (path) {
      admin.initializeApp({ credential: admin.credential.cert(path) });
    } else {
      throw new Error("Firebase Admin credentials not set");
    }
  }
  initialized = true;
};

export const requireAuth = async (req, res, next) => {
  try {
    // ✅ If admin is logging in, skip Firebase check
    if (req.headers["x-admin"] === "true") {
      req.user = { 
        _id: "admin",      // synthetic Mongo-like ID for filtering
        role: "admin",
        email: process.env.ADMIN_EMAIL,
        name: "Admin",
        id: "admin"        // senderId will match this in feedback
      };
      return next();
    }

    // 🔹 Otherwise validate Firebase token
    initFirebase();
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Missing auth token" });

    const decoded = await admin.auth().verifyIdToken(token);

    // 🔹 Get user from MongoDB
    const user = await User.findOne({ uid: decoded.uid });

    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      role: user?.role || "employee",
      name: user?.name || decoded.email,
      id: user?.id || decoded.uid, // HR senderId matches this
    };

    next();
  } catch (e) {
    console.error("Auth error:", e.message);
    res.status(401).json({ message: "Invalid auth token" });
  }
};

export const requireRole = (roles = []) => (req, res, next) => {
  if (!roles.length) return next();
  if (!req.user) return res.status(401).json({ message: "Unauthenticated" });

  // ✅ Allow admin access
  if (req.user.role === "admin") return next();

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  next();
};
