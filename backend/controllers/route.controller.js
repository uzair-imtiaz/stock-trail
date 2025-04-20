const Route = require('../models/route.model');

const createRoute = async (req, res) => {
  const { name, shops } = req.body;

  const route = await Route.create({ name, shops, tenant: req.tenantId });
  if (!route) {
    return res.status(400).json({
      success: false,
      message: 'Failed to create route',
    });
  }

  res.status(201).json({
    success: true,
    message: 'Route created successfully',
    data: route,
  });
};

const getRoutes = async (req, res) => {
  const routes = await Route.find({ tenant: req.tenantId }).populate({
    path: 'shops',
    select: 'name',
  });
  if (!routes) {
    return res.status(400).json({
      success: false,
      message: 'Failed to fetch routes',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Routes fetched successfully',
    data: routes,
  });
};

const getRoutesWithoutShops = async (req, res) => {
  try {
    const routes = await Route.find({ tenant: req.tenantId });
    if (!routes) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch routes',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Routes fetched successfully',
      data: routes,
    });
  } catch (error) {
    console.log('error', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const updateRoute = async (req, res) => {
  const { id } = req.params;
  const { name, shops } = req.body;

  const route = await Route.findOneAndUpdate(
    { _id: id, tenant: req.tenantId },
    { name, shops },
    { new: true }
  );

  if (!route) {
    return res.status(400).json({
      success: false,
      message: 'Failed to update route',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Route updated successfully',
    data: route,
  });
};

const deleteRoute = async (req, res) => {
  const { id } = req.params;
  const route = await Route.findOneAndDelete({ _id: id, tenant: req.tenantId });

  if (!route) {
    return res.status(400).json({
      success: false,
      message: 'Failed to delete route',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Route deleted successfully',
  });
};

module.exports = {
  createRoute,
  getRoutes,
  updateRoute,
  deleteRoute,
  getRoutesWithoutShops,
};
