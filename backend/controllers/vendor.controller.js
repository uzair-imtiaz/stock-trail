const Vendor = require('../models/vendor.model');

const getVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find({ tenant: req.tenantId });
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
    const { id: vendorId } = req.params;
    const vendor = await Vendor.findOne({ vendorId, tenant: req.tenantId });
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
    const vendor = await Vendor.create({ ...req.body, tenant: req.tenantId });
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
    const { id: vendorId } = req.params;
    const vendor = await Vendor.findOneAndUpdate(
      { vendorId, tenant: req.tenantId },
      req.body,
      {
        new: true,
      }
    );
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
    const { id: vendorId } = req.params;
    const vendor = await Vendor.findOneAndDelete({
      vendorId,
      tenant: req.tenantId,
    });
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
  deleteVendor,
};
