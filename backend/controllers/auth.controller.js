const User = require('../models/user.model');
const Tenant = require('../models/tenant.model');
const { generateToken } = require('../utils/auth.util');
const bcrypt = require('bcryptjs');

const register = async (req, res) => {
  try {
    const { name, email, password, businessName } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: 'User already exists' });
    }

    let tenant = await Tenant.findOne({ name: businessName });
    if (tenant) {
      return res
        .status(400)
        .json({ success: false, message: 'Business name already taken' });
    }

    tenant = await Tenant.create({
      name: businessName,
      slug: businessName.toLowerCase().replace(/\s+/g, '-'),
      owner: null,
    });

    const user = await User.create({
      name,
      email,
      password,
      role: 'admin',
      tenant: tenant._id,
    });

    tenant.owner = user._id;
    await tenant.save();

    const token = await generateToken(user);
    res.status(201).json({
      success: true,
      message: 'Business registered successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenant: tenant._id,
        token,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate('tenantId');
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: 'Wrong Password' });
    }

    const token = await generateToken(user, user.tenantId);
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
          tenant: user.tenantId,
          token,
        },
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const logout = async (req, res) => {
  res.clearCookie('token');
  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
};

const me = async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
};

module.exports = { login, register, me, logout };
