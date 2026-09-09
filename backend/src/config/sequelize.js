const { Sequelize } = require('sequelize')

const sequelize = new Sequelize(
  process.env.DB_NAME || 'monthly_budget',
  process.env.DB_USER || 'maula',
  process.env.DB_PASSWORD || 'M@ulaS@ja5731',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    dialect: 'mysql',

    logging: false,

    define: {
      timestamps: true,
      underscored: true
    }
  }
)

module.exports = sequelize
