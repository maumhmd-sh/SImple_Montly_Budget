const { DataTypes } =
    require('sequelize')


const sequelize =
    require('../config/sequelize')


const Account =
    sequelize.define(
        'Account',
        {

            id: {
                type:
                    DataTypes.BIGINT.UNSIGNED,

                primaryKey:
                    true,

                autoIncrement:
                    true
            },


            user_id: {
                type:
                    DataTypes.BIGINT.UNSIGNED,

                allowNull:
                    false
            },


            name: {
                type:
                    DataTypes.STRING(100),

                allowNull:
                    false
            },


            type: {
                type:
                    DataTypes.ENUM(
                        'cash',
                        'bank',
                        'ewallet'
                    ),

                allowNull:
                    false,

                defaultValue:
                    'cash'
            },


            balance: {
                type:
                    DataTypes.DECIMAL(15, 2),

                allowNull:
                    false,

                defaultValue:
                    0
            }

        },
        {

            tableName:
                'accounts',

            timestamps:
                true,

            underscored:
                true

        }
    )


module.exports =
    Account