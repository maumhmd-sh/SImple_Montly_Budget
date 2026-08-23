const { DataTypes } = require('sequelize')
const sequelize = require('../config/sequelize')

const SavingsTransaction = sequelize.define(
    'SavingsTransaction',
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

        saving_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false
        },

        type: {
            type: DataTypes.ENUM(
                'deposit',
                'withdrawal'
            ),
            allowNull: false
        },

        amount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false
        },

        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },

        transaction_date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        }
    },
    {
        tableName: 'savings_transactions',
        timestamps: true,
        underscored: true
    }
)

module.exports = SavingsTransaction
