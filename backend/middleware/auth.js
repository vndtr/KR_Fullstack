

const jwt = require("jsonwebtoken");

const ACCESS_SECRET = "bookstore_access_secret_2026";

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";

  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ 
      error: "Missing or invalid Authorization header" 
    });
  }

  try {
    const payload = jwt.verify(token, ACCESS_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ 
      error: "Invalid or expired token" 
    });
  }
}

module.exports = authMiddleware;