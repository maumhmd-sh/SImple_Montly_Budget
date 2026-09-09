const { DataTypes } = require('sequelize')
const sequelize = require('../config/sequelize')


const Notification = sequelize.define(

    'Notification',

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


        type: {

            type: DataTypes.STRING(50),

            allowNull: false,

            defaultValue: 'system'

        },


        title: {

            type: DataTypes.STRING(150),

            allowNull: false

        },


        message: {

            type: DataTypes.STRING(500),

            allowNull: false

        },


        is_read: {

            type: DataTypes.BOOLEAN,

            allowNull: false,

            defaultValue: false

        }

    },

    {

        tableName: 'notifications',

        timestamps: true,

        underscored: true

    }

)


module.exports = Notification