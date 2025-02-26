import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

// User Registration Controller
export const register = async (req, res) => {
  try {
    const { username, email, password, referralCode } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    // Generate referral code
    const userReferralCode = username + Math.floor(Math.random() * 10000);
    
    // Create new user
    const newUser = new User({
      username,
      email,
      password: await bcrypt.hash(password, 10),
      referralCode: userReferralCode,
      referredBy: referralCode || null,
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// User Login Controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { username: user.username, email: user.email, referralCode: user.referralCode } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
