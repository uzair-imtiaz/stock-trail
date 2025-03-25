const User = require('../models/user.model');
const { asyncHandler } = require('../utils/error.util');

const getUsers = async (req, res) => {
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

const updateUserAccess = async (req, res) => {
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

const getSingleUSer = asyncHandler(async (req, res) => {
  const { role } = req.params;
  const users = await User.find({ role });

  if (!users) {
    return res.status(404).json({ success: false, message: 'User not found' });
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
    message: 'User fetched successfully',
  });
});

const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const admin = req.user;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      tenantId: admin.tenantId,
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
        tenantId: user.tenantId,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Internal Servwer Error' });
  }
};

module.exports = {
  getUsers,
  updateUserAccess,
  getSingleUSer,
  createUser,
};
