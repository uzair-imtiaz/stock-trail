const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id)
        .populate('tenant')
        .select('-password');
      if (!req.user) {
        return res
          .status(401)
          .json({ success: false, message: 'User not found' });
      }
      next();
    } catch (error) {
      console.log('error', error)
      return res.status(500).json({
        success: false,
        message: 'Internal Server Error',
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user?.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
    });
  }
};

module.exports = {
  authMiddleware,
  isAdmin,
};
