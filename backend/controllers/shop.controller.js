const Shop = require('../models/shop.model');

const getShops = async (req, res) => {
  try {
    const shops = await Shop.find();
    if (!shops) {
      return res
        .status(400)
        .json({ success: false, message: 'Unable to fetch shops' });
    }

    res.status(200).json({
      success: true,
      message: 'Shops fetched successfully',
      data: shops,
    });
  } catch(error) {
    console.log('error', error)
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const createShop = async (req, res) => {
  try {
    const { name } = req.body;
    const shop = await Shop.create({ name });
    if (!shop) {
      return res
        .status(400)
        .json({ success: false, message: 'Unable to create shop' });
    }
    res.status(201).json({
      success: true,
      message: 'Shop created successfully',
      data: shop,
    });
  } catch {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const updateShop = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const shop = await Shop.findByIdAndUpdate(id, { name }, { new: true });
    if (!shop) {
      return res
        .status(400)
        .json({ success: false, message: 'Unable to update shop' });
    }
    res.status(200).json({
      success: true,
      message: 'Shop updated successfully',
      data: shop,
    });
  } catch {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

module.exports = {
  getShops,
  createShop,
  updateShop,
};
