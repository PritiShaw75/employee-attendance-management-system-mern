const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Please login first" });
  }

  try {
    const token = header.split(" ")[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
}

function hrOnly(req, res, next) {
  if (req.user.role !== "hr") {
    return res.status(403).json({ message: "HR access only" });
  }
  next();
}

module.exports = { auth, hrOnly };
