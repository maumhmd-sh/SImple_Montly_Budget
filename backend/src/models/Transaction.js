const { DataTypes } = require('sequelize')

const sequelize = require('../config/sequelize')

const Transaction = sequelize.define(
    'Transaction',
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

        account_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false
        },

        type: {
            type: DataTypes.ENUM(
                'income',
                'expense'
            ),
            allowNull: false
        },

        amount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false
        },

        description: {
            type: DataTypes.STRING(255),
            allowNull: true
        },

        transaction_date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        }
    },
    {
        tableName: 'transactions',
        timestamps: true,
        underscored: true
    }
)

module.exports = Transaction