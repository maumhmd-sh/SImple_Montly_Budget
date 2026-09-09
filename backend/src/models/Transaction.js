const { DataTypes } = require('sequelize')

const sequelize =
    require('../config/sequelize')


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
    allowNull: true,
    defaultValue: null
},


        account_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false
        },


        /*
         * ID tabungan tujuan / sumber.
         *
         * NULL untuk:
         * - income
         * - expense
         *
         * Berisi saving ID untuk:
         * - transfer
         */
        saving_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: true,
            defaultValue: null
        },


        /*
         * income
         *   Uang masuk ke account
         *
         * expense
         *   Uang keluar dari account
         *
         * transfer
         *   Uang berpindah antara
         *   account dan savings
         */
        type: {
            type: DataTypes.ENUM(
                'income',
                'expense',
                'transfer'
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

        tableName:
            'transactions',

        timestamps:
            true,

        underscored:
            true

    }
)


module.exports =
    Transaction