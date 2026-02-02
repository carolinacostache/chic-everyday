import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Not authenticated!" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = payload.userId;
    next();
    
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(403).json({ message: "Token is invalid!" });
    }
    
    console.error("Eroare în verifyToken:", err);
    return res.status(500).json({ message: "Server error in authentication" });
  }
};