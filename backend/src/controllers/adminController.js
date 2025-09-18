// controllers/adminController.js
/**
 * Admin Login (no Firebase/JWT, simple check)
 */
export const loginAdmin = (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      return res.json({
        success: true,
        role: "admin",
        message: "Admin login successful",
        // Later you can replace `null` with a JWT
        token: null,
      });
    }

    return res
      .status(401)
      .json({ success: false, message: "Invalid admin credentials" });
  } catch (err) {
    console.error("Admin login error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /api/admin/me
 * Returns static admin profile
 */
export const meAdmin = (req, res) => {
  try {
    res.json({
      employeeId: "ADMIN001",
      name: process.env.ADMIN_NAME || "Admin",
      email: process.env.ADMIN_EMAIL || "admin@example.com",
      role: "admin",
    });
  } catch (err) {
    console.error("Admin profile error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};