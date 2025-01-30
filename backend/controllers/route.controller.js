import Route from '../models/route.model.js';

export const createRoute = async (req, res) => {
  const { name, shops } = req.body;

  const route = await Route.create({ name, shops });
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

export const getRoutes = async (_, res) => {
  const routes = await Route.find();
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

export const updateRoute = async (req, res) => {
  const { id } = req.params;
  const { name, shops } = req.body;

  const route = await Route.findByIdAndUpdate(
    id,
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

export const deleteRoute = async (req, res) => {
  const { id } = req.params;
  const route = await Route.findByIdAndDelete(id);

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
