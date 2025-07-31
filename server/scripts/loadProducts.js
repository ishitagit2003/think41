// server/scripts/loadProducts.js
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const mysql = require('mysql2/promise');
const cfg = require('../db/config');

const CSV_PATH = process.env.CSV_PATH || 'C:/full/path/to/products.csv';

// EXACT header order from your CSV (adjust if needed):
const fields = [
  'id','cost','category','name','brand','retail_price','department','sku','distribution_center_id'
];

function toNumber(v) {
  if (v == null) return null;
  const s = String(v).replace(/,/g, '').trim();   // “1,299.00” -> “1299.00”
  if (s === '') return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

(async () => {
  const conn = await mysql.createConnection({
    host: cfg.host,
    user: cfg.user,
    password: cfg.password,
    database: cfg.database,
    multipleStatements: false,
    // enable LOCAL INFILE if you later switch to LOAD DATA
    // flags: ['+LOCAL_FILES'],
  });

  // Verify table exists (safety)
  await conn.execute(`CREATE TABLE IF NOT EXISTS products (
    product_pk INT AUTO_INCREMENT PRIMARY KEY,
    id VARCHAR(64),
    name VARCHAR(255),
    brand VARCHAR(255),
    category VARCHAR(255),
    department VARCHAR(255),
    sku VARCHAR(128),
    cost DECIMAL(10,2),
    retail_price DECIMAL(10,2),
    distribution_center_id VARCHAR(64)
  )`);

  const parser = fs.createReadStream(CSV_PATH).pipe(parse({
    columns: true,            // use header row
    skip_empty_lines: true,
    relax_column_count: true
  }));

  const insertSQL = `
    INSERT INTO products (${fields.join(',')})
    VALUES (${fields.map(() => '?').join(',')})
  `;

  const batch = [];
  const batchSize = 1000;
  let total = 0;

  for await (const row of parser) {
    // Map row to expected field order
    const rec = fields.map((k) => {
      if (k === 'cost' || k === 'retail_price') return toNumber(row[k]);
      const v = row[k];
      return v === '' ? null : v;
    });
    batch.push(rec);

    if (batch.length >= batchSize) {
      // Flatten [[...],[...]] to single array for mysql2 prepared statement bulk
      const flat = batch.flat();
      const placeholders = batch.map(() => `(${fields.map(() => '?').join(',')})`).join(',');
      await conn.query(
        `INSERT INTO products (${fields.join(',')}) VALUES ${placeholders}`,
        flat
      );
      total += batch.length;
      console.log(`Inserted ${total} rows...`);
      batch.length = 0;
    }
  }

  if (batch.length) {
    const flat = batch.flat();
    const placeholders = batch.map(() => `(${fields.map(() => '?').join(',')})`).join(',');
    await conn.query(
      `INSERT INTO products (${fields.join(',')}) VALUES ${placeholders}`,
      flat
    );
    total += batch.length;
  }

  console.log(`Done. Inserted ${total} rows.`);

  // Optional indexes (faster queries later)
  await conn.query('CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku)');
  await conn.query('CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)');

  // Verification queries
  const [rc]  = await conn.query('SELECT COUNT(*) AS row_count FROM products');
  const [peek] = await conn.query('SELECT product_pk, id, name, brand, category, sku, cost, retail_price FROM products LIMIT 10');
  console.log('Row count:', rc[0].row_count);
  console.table(peek);

  await conn.end();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
