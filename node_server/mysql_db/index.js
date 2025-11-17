const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_DOCKER_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// A simple query function
const query = async (sql, values) => {
  try {
    const [rows, fields] = await pool.execute(sql, values);
    return { rows, fields }; // Returning in a similar structure to pg for less refactoring
  } catch (error) {
    console.error('MySQL query error:', error);
    throw error;
  }
};

// A connect function to check the connection
const connect = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('MySQL connected successfully.');
    connection.release();
  } catch (error) {
    console.error('Failed to connect to MySQL:', error);
    throw error;
  }
};

module.exports = {
  query,
  connect,
  pool // Exporting the pool itself can be useful
};