const jwt = require('jsonwebtoken');

const tenantMiddleware = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.tenantId = decoded.tenant?._id;
    next();
  } catch (error) {
    console.log('error', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

module.exports = tenantMiddleware;
