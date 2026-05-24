import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// generates a JWT token for a user id
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// formats user object to send back in response
// we never send the password back
const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  age: user.age,
  gender: user.gender,
  weight: user.weight,
  height: user.height,
  fitnessGoal: user.fitnessGoal,
  experienceLevel: user.experienceLevel,
  profilePhoto: user.profilePhoto,
  currentStreak: user.currentStreak,
});

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // validate required fields
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }

    // check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user — only name, email, password at registration
    // rest of profile filled in later
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: formatUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: formatUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/auth/me — get currently logged in user
export const getMe = async (req, res) => {
  try {
    // req.user is set by the protect middleware
    res.json({ user: formatUser(req.user) });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/auth/profile — update profile details
export const updateProfile = async (req, res) => {
  try {
    const { name, age, gender, weight, height, fitnessGoal, experienceLevel } =
      req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, age, gender, weight, height, fitnessGoal, experienceLevel },
      { new: true }, // return the updated document
    ).select("-password");

    res.json({ user: formatUser(user) });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
