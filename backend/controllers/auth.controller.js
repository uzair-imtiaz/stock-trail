import User from '../models/user.model.js';
import { generateToken } from '../utils/auth.util.js';

export const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400).json({ message: 'User already exists' });
    return;
  }
  const user = await User.create({ name, email, password, role });
  if (user) {
    const token = await generateToken(user._id);
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        modules: user.modules,
        token,
      },
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Invalid user data',
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(400).json({
      success: false,
      message: 'Invalid email or password',
    });
    return;
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(400).json({
      success: false,
      message: 'Invalid email or password',
    });
    return;
  }

  const token = await generateToken(user);
  return res
    .cookie('token', token, {
      httpOnly: false,
      sameSite: 'None',
      secure: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        modules: user.modules,
        token,
      },
    });
};

export const logout = async (req, res) => {
  res.clearCookie('token');
  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
};

export const me = async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
};
