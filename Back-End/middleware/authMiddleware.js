const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodedPayload;
    next();
  } catch (ex) {
    console.error("JWT verification error:", ex.message); // Log the actual error
    res.status(400).json({ message: "Invalid token." });
  }
};

module.exports = authMiddleware;
