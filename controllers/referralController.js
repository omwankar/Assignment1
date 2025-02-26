import User from '../models/user.js';

// Referral Tracking Controller
export const getReferrals = async (req, res) => {
  try {
    const { userId } = req.query;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const referrals = await User.find({ referredBy: user.referralCode });
    res.json({ referrals, count: referrals.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
