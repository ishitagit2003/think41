const mysql = require('mysql2/promise');
const dbConfig = require('../../db/config');

const getConnection = () => mysql.createConnection(dbConfig);

const getAllProducts = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const conn = await getConnection();
  const [rows] = await conn.execute(
    'SELECT * FROM products LIMIT ? OFFSET ?',
    [Number(limit), Number(offset)]
  );
  return rows;
};

const getProductById = async (id) => {
  const conn = await getConnection();
  const [rows] = await conn.execute('SELECT * FROM products WHERE id = ?', [id]);
  return rows[0];
};

module.exports = { getAllProducts, getProductById };
