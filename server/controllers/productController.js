const productModel = require('../models/productModel');

const getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const products = await productModel.getAllProducts(page, limit);
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await productModel.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = { getAllProducts, getProductById };
