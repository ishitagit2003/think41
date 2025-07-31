const mysql = require('mysql2/promise');
const cfg = require('../db/config');

// GET /api/products?page=1&limit=10
exports.getAllProducts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const conn = await mysql.createConnection(cfg);
    const [rows] = await conn.execute('SELECT * FROM products LIMIT ? OFFSET ?', [limit, offset]);
    const [countResult] = await conn.execute('SELECT COUNT(*) as total FROM products');
    const total = countResult[0].total;

    res.json({
      success: true,
      data: rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching products', error: err.message });
  }
};

// GET /api/products/:id
exports.getProductById = async (req, res) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return res.status(400).json({ success: false, message: 'Invalid product ID' });
  }

  try {
    const conn = await mysql.createConnection(cfg);
    const [rows] = await conn.execute('SELECT * FROM products WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching product', error: err.message });
  }
};
