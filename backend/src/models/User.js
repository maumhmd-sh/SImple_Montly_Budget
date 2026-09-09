const { DataTypes } = require('sequelize')
const sequelize = require('../config/sequelize')

const User = sequelize.define(
    'User',
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },

        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },

        email: {
            type: DataTypes.STRING(191),
            allowNull: false,
            unique: true
        },

        password_hash: {
            type: DataTypes.STRING(255),
            allowNull: false
        },

        theme: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: 'system'
        },

        accent_color: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: 'blue'
        }
    },

    {
        tableName: 'users',

        timestamps: true,

        underscored: true
    }
)

module.exports = User