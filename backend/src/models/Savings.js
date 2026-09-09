const { DataTypes } = require('sequelize')
const sequelize = require('../config/sequelize')

const Savings = sequelize.define(
    'Savings',
    {
        /*
        |--------------------------------------------------------------------------
        | PRIMARY KEY
        |--------------------------------------------------------------------------
        */

        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },


        /*
        |--------------------------------------------------------------------------
        | USER
        |--------------------------------------------------------------------------
        */

        user_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false
        },


        /*
        |--------------------------------------------------------------------------
        | NAME
        |--------------------------------------------------------------------------
        */

        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },


        /*
        |--------------------------------------------------------------------------
        | SAVINGS TYPE
        |--------------------------------------------------------------------------
        |
        | target = Tabungan dengan target
        | free   = Tabungan bebas / enjoy
        |
        */

        type: {
            type: DataTypes.ENUM(
                'target',
                'free'
            ),

            allowNull: false,

            defaultValue: 'target'
        },


        /*
        |--------------------------------------------------------------------------
        | TARGET AMOUNT
        |--------------------------------------------------------------------------
        |
        | Hanya digunakan untuk tabungan type = target.
        |
        | Tabungan free boleh NULL.
        |
        */

        target_amount: {
            type: DataTypes.DECIMAL(15, 2),

            allowNull: true,

            defaultValue: null
        },


        /*
        |--------------------------------------------------------------------------
        | CURRENT AMOUNT
        |--------------------------------------------------------------------------
        |
        | Saldo tabungan saat ini.
        |
        */

        current_amount: {
            type: DataTypes.DECIMAL(15, 2),

            allowNull: false,

            defaultValue: 0
        },


        /*
        |--------------------------------------------------------------------------
        | ROUTINE AMOUNT
        |--------------------------------------------------------------------------
        |
        | Nominal setoran rutin.
        |
        | Contoh:
        |
        | Rp1.000.000 setiap bulan
        |
        | Ini BUKAN tagihan.
        |
        */

        routine_amount: {
            type: DataTypes.DECIMAL(15, 2),

            allowNull: true,

            defaultValue: null
        },


        /*
        |--------------------------------------------------------------------------
        | ROUTINE FREQUENCY
        |--------------------------------------------------------------------------
        |
        | weekly  = mingguan
        | monthly = bulanan
        | yearly  = tahunan
        |
        */

        routine_frequency: {
            type: DataTypes.ENUM(
                'weekly',
                'monthly',
                'yearly'
            ),

            allowNull: true,

            defaultValue: null
        },


        /*
        |--------------------------------------------------------------------------
        | ROUTINE DAY
        |--------------------------------------------------------------------------
        |
        | Hari/tanggal setoran rutin.
        |
        | Untuk monthly:
        | 1  = tanggal 1
        | 15 = tanggal 15
        | dst.
        |
        | Untuk weekly:
        | Bisa digunakan sebagai nomor hari
        | sesuai logic controller nantinya.
        |
        */

        routine_day: {
            type: DataTypes.TINYINT.UNSIGNED,

            allowNull: true,

            defaultValue: null
        },


        /*
        |--------------------------------------------------------------------------
        | TARGET DATE
        |--------------------------------------------------------------------------
        |
        | Hanya relevan untuk type = target.
        |
        */

        target_date: {
            type: DataTypes.DATEONLY,

            allowNull: true
        },


        /*
        |--------------------------------------------------------------------------
        | DESCRIPTION
        |--------------------------------------------------------------------------
        */

        description: {
            type: DataTypes.TEXT,

            allowNull: true
        },


        /*
        |--------------------------------------------------------------------------
        | STATUS
        |--------------------------------------------------------------------------
        */

        status: {
            type: DataTypes.ENUM(
                'active',
                'completed',
                'cancelled'
            ),

            allowNull: false,

            defaultValue: 'active'
        }
    },


    /*
    |--------------------------------------------------------------------------
    | MODEL OPTIONS
    |--------------------------------------------------------------------------
    */

    {
        tableName: 'savings',

        timestamps: true,

        underscored: true
    }
)


module.exports = Savings