const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mysql = require('mysql2/promise');
const dbConfig = require('../../db/config');

const csvPath = path.join(__dirname, '../../products.csv');

async function loadCSV() {
  const connection = await mysql.createConnection(dbConfig);
  await connection.execute(`CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY,
    cost DECIMAL(10,2),
    category VARCHAR(255),
    name VARCHAR(255),
    brand VARCHAR(255),
    retail_price DECIMAL(10,2),
    department VARCHAR(255),
    sku VARCHAR(255),
    distribution_center_id INT
  )`);

  const rows = [];
  fs.createReadStream(csvPath)
    .pipe(csv())
    .on('data', (data) => {
      rows.push([
        data.id,
        data.cost,
        data.category,
        data.name,
        data.brand,
        data.retail_price,
        data.department,
        data.sku,
        data.distribution_center_id,
      ]);
    })
    .on('end', async () => {
      const insertQuery = `INSERT INTO products 
        (id, cost, category, name, brand, retail_price, department, sku, distribution_center_id)
        VALUES ?`;
      await connection.query(insertQuery, [rows]);
      console.log('Products inserted!');
      await connection.end();
    });
}

loadCSV();
