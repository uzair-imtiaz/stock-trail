const Deduction = require('../models/deductions.model');

const createDeduction = async (req, res) => {
  try {
    const values = req.body;
    const existingDeduction = await Deduction.findOne({
      type: values.type,
      name: values.name,
      tenant: req.tenantId,
    });
    if (existingDeduction) {
      return res.status(400).json({
        success: false,
        message: `${values.type} with this name already exists`,
      });
    }
    const deduction = await Deduction.create({
      ...values,
      tenant: req.tenantId,
    });
    if (!deduction) {
      return res.status(400).json({
        success: false,
        message: `Could not create ${values.type}`,
      });
    }
    res.status(201).json({
      success: true,
      message: `${values.type} created successfully`,
      data: deduction,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

const getDeductions = async (req, res) => {
  try {
    const deductions = await Deduction.find({ tenant: req.tenantId }).lean();
    if (!deductions) {
      return res.status(400).json({
        success: false,
        message: `Could not fetch deductions`,
      });
    }
    res.status(200).json({
      success: true,
      message: `Deductions fetched successfully`,
      data: deductions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

const updateDeduction = async (req, res) => {
  try {
    const { id } = req.params;
    const values = req.body;

    const deduction = await Deduction.findOneAndUpdate(
      { _id: id, tenant: req.tenantId },
      values,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!deduction) {
      return res.status(404).json({
        success: false,
        message: `Deduction not found`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Deduction updated successfully`,
      data: deduction,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

const deleteDeduction = async (req, res) => {
  try {
    const { id } = req.params;

    const deduction = await Deduction.findOneAndDelete({_id: id, tenant: req.tenantId});

    if (!deduction) {
      return res.status(404).json({
        success: false,
        message: `Deduction not found`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Deduction deleted successfully`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

module.exports = {
  deleteDeduction,
  updateDeduction,
  getDeductions,
  createDeduction,
};
