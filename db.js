const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "pollution_db",
  port: 3306
});

db.connect((err) => {
  if (err) console.log("Database error");
  else console.log("Database connected");
});

module.exports = db;
