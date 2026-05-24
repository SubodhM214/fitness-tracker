import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // check if header exists and starts with Bearer
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorised, no token" });
    }

    // extract token from "Bearer <token>"
    const token = authHeader.split(" ")[1];

    // verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // attach user to request (excluding password)
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    next(); // move to the next middleware or route handler
  } catch (error) {
    res.status(401).json({ message: "Not authorised, token failed" });
  }
};

export default protect;
