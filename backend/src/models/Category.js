const { DataTypes } = require('sequelize')
const sequelize = require('../config/sequelize')

const Category = sequelize.define(
    'Category',
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
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM(
                'income',
                'expense'
            ),
            allowNull: false
        },
        icon: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        color: {
            type: DataTypes.STRING(20),
            allowNull: true
        }
    },
    {
        tableName: 'categories',
        timestamps: true,
        underscored: true
    }
)

module.exports = Category