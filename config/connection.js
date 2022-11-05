
const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "localhost",
  // Your port; if not 3306
  port: 3306,
  // Your username
  user: "root",
  // Your password
  password: "C2b39j5k4036",
  database: "goolies_goons_DB",
});

module.exports = {
    connection
}