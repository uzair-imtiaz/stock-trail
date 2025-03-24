const Vendor = require('../models/vendor.model');

const getVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find();
    if (!vendors) {
      return res
        .status(400)
        .json({ message: 'Unable to fetch vendors', success: false });
    }
    res.status(200).json({
      data: vendors,
      message: 'Vendors fetched successfully',
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', success: false });
  }
};

const getVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({
        message: 'Vendor not found',
        success: false,
      });
    }
    res.status(200).json({
      data: vendor,
      message: 'Vendor fetched successfully',
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', success: false });
  }
};

const createVendor = async (req, res) => {
  try {
    const vendor = await Vendor.create(req.body);
    if (!vendor) {
      return res
        .status(400)
        .json({ message: 'Unable to create vendor', success: false });
    }
    res.status(201).json({
      data: vendor,
      message: 'Vendor created successfully',
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error', success: false });
  }
};

const updateVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!vendor) {
      return res
        .status(404)
        .json({ message: 'Vendor not found', success: false });
    }
    res.status(200).json({
      data: vendor,
      success: true,
      message: 'Vendor updated successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', success: false });
  }
};

const deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);
    if (!vendor) {
      return res
        .status(404)
        .json({ message: 'Vendor not found', success: false });
    }
    res.status(200).json({
      data: vendor,
      success: true,
      message: 'Vendor deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', success: false });
  }
};

module.exports = {
  getVendors,
  getVendor,
  createVendor,
  updateVendor,
  deleteVendor
}