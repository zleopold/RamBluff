const mysql = require('mysql2');

const db = mysql.createConnection({
  connectionLimit: 10,
  host: 'localhost',
  port: 3306, // Adjust the port here
  user: 'root',
  password: 'RamBluffRoot',
  database: 'rambluff_db',
});

module.exports = db;