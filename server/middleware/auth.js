const jwt = require("jsonwebtoken");

// Blocks the request unless a valid token is sent
function requireAuth(req, res, next) {
  const header = req.headers.authorization; // looks like: "Bearer <token>"

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Not logged in" });
  }

  const token = header.split(" ")[1];

  try {
    // checks the signature and expiry, then gives back what we stored inside
    req.user = jwt.verify(token, process.env.JWT_SECRET); // { id, role }
    next(); // allowed: continue to the route
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Blocks the request unless the user has the given role
function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: "Access denied" });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };