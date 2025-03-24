const Deduction = require('../models/deductions.model');

const createDeduction = async (req, res) => {
  try {
    const values = req.body;
    const deduction = await Deduction.create(values);
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
    const deductions = await Deduction.find().lean();
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

    const deduction = await Deduction.findByIdAndUpdate(id, values, {
      new: true,
      runValidators: true,
    });

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

    const deduction = await Deduction.findByIdAndDelete(id);

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
