import User from '../models/user.model.js';
import { asyncHandler } from '../utils/error.util.js';

export const getUsers = async (req, res) => {
  const users = await User.find();
  if (!users) {
    return res.status(404).json({ success: false, message: 'Users not found' });
  }
  res.status(200).json({
    success: true,
    data: users.map((user) => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      modules: user.modules,
    })),
    message: 'Users fetched successfully',
  });
};

export const updateUserAccess = async (req, res) => {
  const { userId } = req.params;
  const { modules } = req.body;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  user.modules = modules;
  await user.save();
  res.status(200).json({
    success: true,
    data: user,
    message: 'User access updated successfully',
  });
};

export const getSingleUSer = asyncHandler(async (req, res) => {
  const { role } = req.params;
  const users = await User.find({ role });

  if (!users) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.status(200).json({
    success: true,
    data: users,
    message: 'User fetched successfully',
  });
});
