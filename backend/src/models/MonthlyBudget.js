const { DataTypes } = require('sequelize')

const sequelize = require('../config/sequelize')


const MonthlyBudget = sequelize.define(
    'MonthlyBudget',
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },

        user_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false
        },

        category_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false
        },

        month: {
            type: DataTypes.TINYINT.UNSIGNED,

            allowNull: false
        },

        year: {
            type: DataTypes.SMALLINT.UNSIGNED,

            allowNull: false
        },

        amount: {
            type: DataTypes.DECIMAL(15, 2),

            allowNull: false
        }
    },
    {
        tableName: 'monthly_budgets',

        timestamps: true,

        underscored: true
    }
)


module.exports = MonthlyBudget