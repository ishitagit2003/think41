const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const csv = require('csv-parser');

dotenv.config(); // Load .env

const dbConfig = require('../db/config');
const connection = mysql.createConnection(dbConfig);

// Connect to MySQL
connection.connect(err => {
  if (err) {
    console.error('❌ MySQL connection failed:', err.message);
    return;
  }
  console.log('✅ MySQL connected');

  const results = [];
  const filePath = path.join(__dirname, '../../products.csv');

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      results.push([
        Number(row.id),
        Number(row.cost),
        row.category,
        row.name,
        row.brand,
        Number(row.retail_price),
        row.department,
        row.sku,
        row.distribution_center_id
      ]);
    })
    .on('end', () => {
      if (results.length === 0) {
        console.log('❗ No data found in CSV');
        connection.end();
        return;
      }

      const insertQuery = `
        INSERT INTO products
        (id, cost, category, name, brand, retail_price, department, sku, distribution_center_id)
        VALUES ?
      `;

      connection.query(insertQuery, [results], (err, result) => {
        if (err) {
          console.error('❌ Error inserting products:', err.message);
        } else {
          console.log(`✅ Inserted ${result.affectedRows} products`);
        }
        connection.end();
      });
    })
    .on('error', (err) => {
      console.error('❌ CSV Read Error:', err.message);
      connection.end();
    });
});
