import User from '../models/User.js';
import SystemLog from '../models/SystemLog.js';

const getAllUsers = async (req, res, next) => {
  try {
    const { userType, page = 1, limit = 20, search } = req.query;
    const filter = {};

    if (userType) filter.userType = userType;
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

const blockUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findByIdAndUpdate(userId, { isActive: false }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await SystemLog.create({
      level: 'warn',
      service: 'admin',
      action: 'USER_BLOCKED',
      message: `User ${userId} blocked by ${req.admin?.username || 'admin'}. Reason: ${reason}`,
      metadata: { userId, adminId: req.admin?._id?.toString(), reason }
    });

    res.json({ success: true, message: 'User blocked successfully' });
  } catch (error) {
    next(error);
  }
};

const unblockUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(userId, { isActive: true }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await SystemLog.create({
      level: 'info',
      service: 'admin',
      action: 'USER_UNBLOCKED',
      message: `User ${userId} unblocked by ${req.admin?.username || 'admin'}`,
      metadata: { userId, adminId: req.admin?._id?.toString() }
    });

    res.json({ success: true, message: 'User unblocked successfully' });
  } catch (error) {
    next(error);
  }
};

export { getAllUsers, blockUser, unblockUser };
