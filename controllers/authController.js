import jwt from 'jsonwebtoken';
import User from '../models/User.js';  // Your Mongoose User model

// Generate JWT token with user ID and role
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

// POST /login handler
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log('LOGIN_ATTEMPT:', { email, password });

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('USER_NOT_FOUND');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log('PASSWORD_MISMATCH');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);
    res.json({
      id: user._id,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

