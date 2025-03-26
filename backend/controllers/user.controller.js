const User = require('../models/user.model');
const { asyncHandler } = require('../utils/error.util');

const getUsers = async (req, res) => {
  const users = await User.find({ tenant: req.tenantId });

  if (!users) {
    return res
      .status(400)
      .json({ success: false, message: 'Could not fetch users' });
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

const updateUserAccess = async (req, res) => {
  const { userId } = req.params;
  const { modules } = req.body;

  const user = await User.findOne({ _id: userId, tenant: req.tenantId });

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  user.modules = modules;
  await user.save();

  res.status(200).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      modules: user.modules,
    },
    message: 'User access updated successfully',
  });
};

const getSingleUser = asyncHandler(async (req, res) => {
  const { role } = req.params;
  const users = await User.find({ role, tenant: req.tenantId });

  if (!users) {
    return res
      .status(400)
      .json({ success: false, message: 'Could not fetch users' });
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
});

const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      tenant: req.tenantId,
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'User not created' });
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenant: user.tenantId,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

module.exports = {
  getUsers,
  updateUserAccess,
  getSingleUser,
  createUser,
};
