import jwt from "jsonwebtoken";

export const verifyAdmin = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Neautorizat: Lipsește token-ul" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(403).json({ message: "Neautorizat: Token invalid" });
    }

    if (!payload.isAdmin) {
      return res.status(403).json({ message: "Interzis: Doar administratorii au acces." });
    }

    req.userId = payload.userId;
    req.isAdmin = true;
    next();
  });
};