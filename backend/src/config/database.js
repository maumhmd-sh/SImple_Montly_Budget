const mysql = require('mysql2/promise')


const pool = mysql.createPool({

  host:
    process.env.DB_HOST ||
    '127.0.0.1',

  port:
    Number(
      process.env.DB_PORT ||
      3306
    ),

  user:
    process.env.DB_USER ||
    'maula',

  password:
    process.env.DB_PASSWORD ||
    'M@ulaS@ja5731',

  database:
    process.env.DB_NAME ||
    'monthly_budget',

  waitForConnections: true,

  connectionLimit: 10,

  queueLimit: 0

})


module.exports = pool