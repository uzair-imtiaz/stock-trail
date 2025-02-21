import { Shop } from '../models/shop.model.js';

export const getShops = async (req, res) => {
  try {
    const shops = await Shop.find();
    if (!shops) {
      res
        .status(400)
        .json({ success: false, message: 'Unable to fetch shops' });
    }

    res.status(200).json({
      success: true,
      message: 'Shops fetched successfully',
      data: shops,
    });
  } catch {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const createShop = async (req, res) => {
  try {
    const { name } = req.body;
    const shop = await Shop.create({ name, address });
    if (!shop) {
      res
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

export const updateShop = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const shop = await Shop.findByIdAndUpdate(id, { name }, { new: true });
    if (!shop) {
      res
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
