import jwt from 'jsonwebtoken';
import User from '../models/User.js';  // Your Mongoose User model

// Generate JWT token with user ID and role included
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },  // Include user role here for authorization checks
    process.env.JWT_SECRET,
    { expiresIn: '1d' }  // Token valid for 1 day
  );
};

// POST /login handler
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify password (assuming your User model has a method `matchPassword`)
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token including user role
    const token = generateToken(user);

    // Respond with user info and token
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
