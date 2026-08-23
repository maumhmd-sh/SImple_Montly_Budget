const {
    Savings,
    SavingsTransaction,
    Notification
} = require('../models')

const sequelize =
    require('../config/sequelize')


/*
|--------------------------------------------------------------------------
| Helper
|--------------------------------------------------------------------------
*/

function toNumber(value) {
    const number = Number(value)

    return Number.isFinite(number)
        ? number
        : NaN
}


function formatRupiah(value) {
    return new Intl.NumberFormat(
        'id-ID',
        {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }
    ).format(
        Number(value)
    )
}


/*
|--------------------------------------------------------------------------
| Validate Saving Type
|--------------------------------------------------------------------------
*/

function normalizeType(type) {

    if (
        type === undefined ||
        type === null ||
        type === ''
    ) {
        return 'target'
    }

    return String(type)
        .trim()
        .toLowerCase()
}


/*
|--------------------------------------------------------------------------
| Validate Routine
|--------------------------------------------------------------------------
*/

function validateRoutine({
    routine_amount,
    routine_frequency,
    routine_day
}) {

    const errors = []

    let normalizedAmount = null
    let normalizedFrequency = null
    let normalizedDay = null


    /*
    |--------------------------------------------------------------------------
    | Routine Amount
    |--------------------------------------------------------------------------
    */

    if (
        routine_amount !== undefined &&
        routine_amount !== null &&
        routine_amount !== ''
    ) {

        normalizedAmount =
            toNumber(routine_amount)


        if (
            !Number.isFinite(
                normalizedAmount
            ) ||
            normalizedAmount <= 0
        ) {

            errors.push(
                'Nominal tabungan rutin harus lebih besar dari 0.'
            )

        }

    }


    /*
    |--------------------------------------------------------------------------
    | Routine Frequency
    |--------------------------------------------------------------------------
    */

    if (
        routine_frequency !== undefined &&
        routine_frequency !== null &&
        routine_frequency !== ''
    ) {

        normalizedFrequency =
            String(
                routine_frequency
            )
                .trim()
                .toLowerCase()


        if (
            ![
                'weekly',
                'monthly',
                'yearly'
            ].includes(
                normalizedFrequency
            )
        ) {

            errors.push(
                'Frekuensi tabungan rutin tidak valid. Gunakan weekly, monthly, atau yearly.'
            )

        }

    }


    /*
    |--------------------------------------------------------------------------
    | Routine Day
    |--------------------------------------------------------------------------
    */

    if (
        routine_day !== undefined &&
        routine_day !== null &&
        routine_day !== ''
    ) {

        normalizedDay =
            Number(routine_day)


        if (
            !Number.isInteger(
                normalizedDay
            ) ||
            normalizedDay < 1 ||
            normalizedDay > 31
        ) {

            errors.push(
                'Hari tabungan rutin harus berupa angka 1 sampai 31.'
            )

        }

    }


    /*
    |--------------------------------------------------------------------------
    | Routine Consistency
    |--------------------------------------------------------------------------
    */

    if (
        normalizedAmount !== null &&
        normalizedFrequency === null
    ) {

        errors.push(
            'Frekuensi wajib diisi jika nominal rutin digunakan.'
        )

    }


    if (
        normalizedFrequency !== null &&
        normalizedAmount === null
    ) {

        errors.push(
            'Nominal rutin wajib diisi jika frekuensi digunakan.'
        )

    }


    /*
    |--------------------------------------------------------------------------
    | Weekly
    |--------------------------------------------------------------------------
    |
    | 1 - 7
    |
    | 1 = Senin
    | 7 = Minggu
    |
    */

    if (
        normalizedFrequency === 'weekly' &&
        normalizedDay !== null &&
        (
            normalizedDay < 1 ||
            normalizedDay > 7
        )
    ) {

        errors.push(
            'Untuk frekuensi weekly, routine_day harus 1 sampai 7.'
        )

    }


    /*
    |--------------------------------------------------------------------------
    | Monthly
    |--------------------------------------------------------------------------
    |
    | 1 - 31
    |
    */

    if (
        normalizedFrequency === 'monthly' &&
        normalizedDay !== null &&
        (
            normalizedDay < 1 ||
            normalizedDay > 31
        )
    ) {

        errors.push(
            'Untuk frekuensi monthly, routine_day harus 1 sampai 31.'
        )

    }


    /*
    |--------------------------------------------------------------------------
    | Yearly
    |--------------------------------------------------------------------------
    |
    | 1 - 12
    |
    | Karena yearly membutuhkan bulan.
    |
    */

    if (
        normalizedFrequency === 'yearly' &&
        normalizedDay !== null &&
        (
            normalizedDay < 1 ||
            normalizedDay > 12
        )
    ) {

        errors.push(
            'Untuk frekuensi yearly, routine_day harus 1 sampai 12.'
        )

    }


    return {
        errors,
        amount:
            normalizedAmount,
        frequency:
            normalizedFrequency,
        day:
            normalizedDay
    }

}


/*
|--------------------------------------------------------------------------
| GET ALL SAVINGS
|--------------------------------------------------------------------------
*/

async function getSavings(req, res) {

    try {

        const savings =
            await Savings.findAll({

                where: {
                    user_id:
                        req.user.id
                },

                include: [
                    {
                        model:
                            SavingsTransaction,

                        as:
                            'transactions',

                        separate:
                            true,

                        order: [

                            [
                                'transaction_date',
                                'DESC'
                            ],

                            [
                                'id',
                                'DESC'
                            ]

                        ]

                    }
                ],

                order: [

                    [
                        'created_at',
                        'DESC'
                    ]

                ]

            })


        return res.json({

            success:
                true,

            data:
                savings

        })


    } catch (error) {

        console.error(
            'GET SAVINGS ERROR:',
            error
        )

        return res.status(500).json({

            success:
                false,

            message:
                'Gagal mengambil data tabungan.'

        })

    }

}


/*
|--------------------------------------------------------------------------
| GET SINGLE SAVING
|--------------------------------------------------------------------------
*/

async function getSaving(req, res) {

    try {

        const saving =
            await Savings.findOne({

                where: {

                    id:
                        req.params.id,

                    user_id:
                        req.user.id

                },

                include: [
                    {
                        model:
                            SavingsTransaction,

                        as:
                            'transactions',

                        separate:
                            true,

                        order: [

                            [
                                'transaction_date',
                                'DESC'
                            ],

                            [
                                'id',
                                'DESC'
                            ]

                        ]

                    }
                ]

            })


        if (!saving) {

            return res.status(404).json({

                success:
                    false,

                message:
                    'Tabungan tidak ditemukan.'

            })

        }


        return res.json({

            success:
                true,

            data:
                saving

        })


    } catch (error) {

        console.error(
            'GET SAVING ERROR:',
            error
        )

        return res.status(500).json({

            success:
                false,

            message:
                'Gagal mengambil data tabungan.'

        })

    }

}


/*
|--------------------------------------------------------------------------
| CREATE SAVING
|--------------------------------------------------------------------------
*/

async function createSaving(req, res) {

    try {

        const {
            name,
            type,
            target_amount,
            routine_amount,
            routine_frequency,
            routine_day,
            target_date,
            description
        } = req.body


        const savingType =
            normalizeType(type)


        const errors = []


        /*
        |--------------------------------------------------------------------------
        | Name
        |--------------------------------------------------------------------------
        */

        if (
            !name ||
            !String(name).trim()
        ) {

            errors.push(
                'Nama tabungan wajib diisi.'
            )

        }


        /*
        |--------------------------------------------------------------------------
        | Type
        |--------------------------------------------------------------------------
        */

        if (
            ![
                'target',
                'free'
            ].includes(
                savingType
            )
        ) {

            errors.push(
                'Tipe tabungan tidak valid. Gunakan target atau free.'
            )

        }


        /*
        |--------------------------------------------------------------------------
        | Target Amount
        |--------------------------------------------------------------------------
        */

        let target = 0


        if (
            savingType === 'target'
        ) {

            target =
                toNumber(
                    target_amount
                )


            if (
                !Number.isFinite(
                    target
                ) ||
                target <= 0
            ) {

                errors.push(
                    'Target tabungan harus lebih besar dari 0.'
                )

            }

        } else {

            /*
            |--------------------------------------------------------------------------
            | FREE SAVING
            |--------------------------------------------------------------------------
            |
            | Free saving tidak membutuhkan target.
            |
            */

            target = 0

        }


        /*
        |--------------------------------------------------------------------------
        | Routine
        |--------------------------------------------------------------------------
        */

        const routine =
            validateRoutine({

                routine_amount,
                routine_frequency,
                routine_day

            })


        errors.push(
            ...routine.errors
        )


        /*
        |--------------------------------------------------------------------------
        | Return Validation Error
        |--------------------------------------------------------------------------
        */

        if (
            errors.length
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    'Data tabungan tidak valid.',

                errors

            })

        }


        /*
        |--------------------------------------------------------------------------
        | Create
        |--------------------------------------------------------------------------
        */

        const saving =
            await Savings.create({

                user_id:
                    req.user.id,

                name:
                    String(name).trim(),

                type:
                    savingType,

                target_amount:
                    target,

                current_amount:
                    0,

                routine_amount:
                    routine.amount,

                routine_frequency:
                    routine.frequency,

                routine_day:
                    routine.day,

                target_date:
                    target_date ||
                    null,

                description:
                    description
                        ? String(
                            description
                        ).trim()
                        : null,

                status:
                    'active'

            })


        /*
        |--------------------------------------------------------------------------
        | Notification
        |--------------------------------------------------------------------------
        */

        if (Notification) {

            const notificationMessage =
                savingType === 'target'

                    ? `Tabungan "${saving.name}" berhasil dibuat dengan target ${formatRupiah(target)}.`

                    : `Tabungan bebas "${saving.name}" berhasil dibuat.`


            await Notification.create({

                user_id:
                    req.user.id,

                type:
                    'saving',

                title:
                    'Tabungan baru dibuat',

                message:
                    notificationMessage,

                is_read:
                    false

            })

        }


        return res.status(201).json({

            success:
                true,

            message:
                'Tabungan berhasil dibuat.',

            data:
                saving

        })


    } catch (error) {

        console.error(
            'CREATE SAVING ERROR:',
            error
        )

        return res.status(500).json({

            success:
                false,

            message:
                'Gagal membuat tabungan.'

        })

    }

}


/*
|--------------------------------------------------------------------------
| UPDATE SAVING
|--------------------------------------------------------------------------
*/

async function updateSaving(req, res) {

    try {

        const saving =
            await Savings.findOne({

                where: {

                    id:
                        req.params.id,

                    user_id:
                        req.user.id

                }

            })


        if (!saving) {

            return res.status(404).json({

                success:
                    false,

                message:
                    'Tabungan tidak ditemukan.'

            })

        }


        const {
            name,
            type,
            target_amount,
            routine_amount,
            routine_frequency,
            routine_day,
            target_date,
            description,
            status
        } = req.body


        /*
        |--------------------------------------------------------------------------
        | Type
        |--------------------------------------------------------------------------
        */

        let savingType =
            normalizeType(
                saving.type
            )


        if (
            type !== undefined
        ) {

            savingType =
                normalizeType(type)


            if (
                ![
                    'target',
                    'free'
                ].includes(
                    savingType
                )
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        'Tipe tabungan tidak valid. Gunakan target atau free.'

                })

            }

        }


        /*
        |--------------------------------------------------------------------------
        | Name
        |--------------------------------------------------------------------------
        */

        if (
            name !== undefined
        ) {

            if (
                !String(name).trim()
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        'Nama tabungan tidak boleh kosong.'

                })

            }


            saving.name =
                String(name).trim()

        }


        /*
        |--------------------------------------------------------------------------
        | Target
        |--------------------------------------------------------------------------
        */

        if (
            savingType === 'free'
        ) {

            /*
            |--------------------------------------------------------------------------
            | Free saving tidak menggunakan target.
            |--------------------------------------------------------------------------
            */

            saving.type =
                'free'

            saving.target_amount =
                0


            /*
            |--------------------------------------------------------------------------
            | Jika sebelumnya completed,
            | free saving harus tetap active.
            |--------------------------------------------------------------------------
            */

            if (
                saving.status === 'completed'
            ) {

                saving.status =
                    'active'

            }

        } else {

            saving.type =
                'target'


            if (
                target_amount !== undefined
            ) {

                const target =
                    toNumber(
                        target_amount
                    )


                if (
                    !Number.isFinite(
                        target
                    ) ||
                    target <= 0
                ) {

                    return res.status(400).json({

                        success:
                            false,

                        message:
                            'Target tabungan tidak valid.'

                    })

                }


                if (
                    target <
                    Number(
                        saving.current_amount
                    )
                ) {

                    return res.status(400).json({

                        success:
                            false,

                        message:
                            'Target tidak boleh lebih kecil dari saldo tabungan saat ini.'

                    })

                }


                saving.target_amount =
                    target

            }


            /*
            |--------------------------------------------------------------------------
            | Recalculate completed status
            |--------------------------------------------------------------------------
            */

            if (
                Number(
                    saving.target_amount
                ) > 0 &&
                Number(
                    saving.current_amount
                ) >= Number(
                    saving.target_amount
                )
            ) {

                saving.status =
                    'completed'

            }

        }


        /*
        |--------------------------------------------------------------------------
        | Routine
        |--------------------------------------------------------------------------
        */

        const routine =
            validateRoutine({

                routine_amount:
                    routine_amount !== undefined
                        ? routine_amount
                        : saving.routine_amount,

                routine_frequency:
                    routine_frequency !== undefined
                        ? routine_frequency
                        : saving.routine_frequency,

                routine_day:
                    routine_day !== undefined
                        ? routine_day
                        : saving.routine_day

            })


        if (
            routine.errors.length
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    'Data tabungan rutin tidak valid.',

                errors:
                    routine.errors

            })

        }


        /*
        |--------------------------------------------------------------------------
        | Only update routine fields when supplied
        |--------------------------------------------------------------------------
        */

        if (
            routine_amount !== undefined
        ) {

            saving.routine_amount =
                routine.amount

        }


        if (
            routine_frequency !== undefined
        ) {

            saving.routine_frequency =
                routine.frequency

        }


        if (
            routine_day !== undefined
        ) {

            saving.routine_day =
                routine.day

        }


        /*
        |--------------------------------------------------------------------------
        | Target Date
        |--------------------------------------------------------------------------
        */

        if (
            target_date !== undefined
        ) {

            saving.target_date =
                target_date ||
                null

        }


        /*
        |--------------------------------------------------------------------------
        | Description
        |--------------------------------------------------------------------------
        */

        if (
            description !== undefined
        ) {

            saving.description =
                description
                    ? String(
                        description
                    ).trim()
                    : null

        }


        /*
        |--------------------------------------------------------------------------
        | Status
        |--------------------------------------------------------------------------
        */

        if (
            status !== undefined
        ) {

            if (
                ![
                    'active',
                    'completed',
                    'cancelled'
                ].includes(
                    status
                )
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        'Status tabungan tidak valid.'

                })

            }


            /*
            |--------------------------------------------------------------------------
            | Free saving tidak boleh dipaksa completed
            |--------------------------------------------------------------------------
            */

            if (
                savingType === 'free' &&
                status === 'completed'
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        'Tabungan bebas tidak menggunakan status completed.'

                })

            }


            saving.status =
                status

        }


        await saving.save()


        return res.json({

            success:
                true,

            message:
                'Tabungan berhasil diperbarui.',

            data:
                saving

        })


    } catch (error) {

        console.error(
            'UPDATE SAVING ERROR:',
            error
        )

        return res.status(500).json({

            success:
                false,

            message:
                'Gagal memperbarui tabungan.'

        })

    }

}


/*
|--------------------------------------------------------------------------
| DELETE SAVING
|--------------------------------------------------------------------------
*/

async function deleteSaving(req, res) {

    try {

        const saving =
            await Savings.findOne({

                where: {

                    id:
                        req.params.id,

                    user_id:
                        req.user.id

                }

            })


        if (!saving) {

            return res.status(404).json({

                success:
                    false,

                message:
                    'Tabungan tidak ditemukan.'

            })

        }


        const name =
            saving.name


        await saving.destroy()


        if (Notification) {

            await Notification.create({

                user_id:
                    req.user.id,

                type:
                    'saving',

                title:
                    'Tabungan dihapus',

                message:
                    `Tabungan "${name}" berhasil dihapus.`,

                is_read:
                    false

            })

        }


        return res.json({

            success:
                true,

            message:
                'Tabungan berhasil dihapus.'

        })


    } catch (error) {

        console.error(
            'DELETE SAVING ERROR:',
            error
        )

        return res.status(500).json({

            success:
                false,

            message:
                'Gagal menghapus tabungan.'

        })

    }

}


/*
|--------------------------------------------------------------------------
| DEPOSIT
|--------------------------------------------------------------------------
*/

async function depositSaving(req, res) {

    const transaction =
        await sequelize.transaction()


    try {

        const saving =
            await Savings.findOne({

                where: {

                    id:
                        req.params.id,

                    user_id:
                        req.user.id

                },

                transaction,

                lock:
                    transaction.LOCK.UPDATE

            })


        if (!saving) {

            await transaction.rollback()

            return res.status(404).json({

                success:
                    false,

                message:
                    'Tabungan tidak ditemukan.'

            })

        }


        if (
            saving.status === 'cancelled'
        ) {

            await transaction.rollback()

            return res.status(400).json({

                success:
                    false,

                message:
                    'Tabungan sudah dibatalkan.'

            })

        }


        const {
            amount,
            description,
            transaction_date
        } = req.body


        const depositAmount =
            toNumber(amount)


        if (
            !Number.isFinite(
                depositAmount
            ) ||
            depositAmount <= 0
        ) {

            await transaction.rollback()

            return res.status(400).json({

                success:
                    false,

                message:
                    'Nominal deposit tidak valid.'

            })

        }


        const current =
            Number(
                saving.current_amount
            )


        const newAmount =
            current +
            depositAmount


        saving.current_amount =
            newAmount


        /*
        |--------------------------------------------------------------------------
        | AUTO COMPLETE
        |--------------------------------------------------------------------------
        |
        | Hanya target saving.
        |
        */

        if (
            saving.type === 'target' &&
            Number(
                saving.target_amount
            ) > 0 &&
            newAmount >=
                Number(
                    saving.target_amount
                )
        ) {

            saving.status =
                'completed'

        }


        await saving.save({

            transaction

        })


        const savingTransaction =
            await SavingsTransaction.create({

                user_id:
                    req.user.id,

                saving_id:
                    saving.id,

                type:
                    'deposit',

                amount:
                    depositAmount,

                description:
                    description
                        ? String(
                            description
                        ).trim()
                        : null,

                transaction_date:
                    transaction_date ||
                    new Date()

            }, {

                transaction

            })


        await transaction.commit()


        if (Notification) {

            await Notification.create({

                user_id:
                    req.user.id,

                type:
                    'saving',

                title:
                    'Tabungan bertambah',

                message:
                    `Deposit ${formatRupiah(depositAmount)} ditambahkan ke tabungan "${saving.name}".`,

                is_read:
                    false

            })

        }


        return res.status(201).json({

            success:
                true,

            message:
                'Deposit berhasil ditambahkan.',

            data: {

                saving,

                transaction:
                    savingTransaction

            }

        })


    } catch (error) {

        try {

            await transaction.rollback()

        } catch {}


        console.error(
            'DEPOSIT SAVING ERROR:',
            error
        )


        return res.status(500).json({

            success:
                false,

            message:
                'Gagal menambahkan deposit.'

        })

    }

}


/*
|--------------------------------------------------------------------------
| WITHDRAW
|--------------------------------------------------------------------------
*/

async function withdrawSaving(req, res) {

    const transaction =
        await sequelize.transaction()


    try {

        const saving =
            await Savings.findOne({

                where: {

                    id:
                        req.params.id,

                    user_id:
                        req.user.id

                },

                transaction,

                lock:
                    transaction.LOCK.UPDATE

            })


        if (!saving) {

            await transaction.rollback()

            return res.status(404).json({

                success:
                    false,

                message:
                    'Tabungan tidak ditemukan.'

            })

        }


        const {
            amount,
            description,
            transaction_date
        } = req.body


        const withdrawAmount =
            toNumber(amount)


        if (
            !Number.isFinite(
                withdrawAmount
            ) ||
            withdrawAmount <= 0
        ) {

            await transaction.rollback()

            return res.status(400).json({

                success:
                    false,

                message:
                    'Nominal withdrawal tidak valid.'

            })

        }


        const current =
            Number(
                saving.current_amount
            )


        if (
            withdrawAmount >
            current
        ) {

            await transaction.rollback()

            return res.status(400).json({

                success:
                    false,

                message:
                    'Saldo tabungan tidak mencukupi.'

            })

        }


        saving.current_amount =
            current -
            withdrawAmount


        /*
        |--------------------------------------------------------------------------
        | Jika target sebelumnya completed
        |--------------------------------------------------------------------------
        |
        | Setelah saldo ditarik dan saldo berada di bawah target,
        | status kembali active.
        |
        */

        if (
            saving.type === 'target' &&
            saving.status === 'completed' &&
            saving.current_amount <
                Number(
                    saving.target_amount
                )
        ) {

            saving.status =
                'active'

        }


        await saving.save({

            transaction

        })


        const savingTransaction =
            await SavingsTransaction.create({

                user_id:
                    req.user.id,

                saving_id:
                    saving.id,

                type:
                    'withdrawal',

                amount:
                    withdrawAmount,

                description:
                    description
                        ? String(
                            description
                        ).trim()
                        : null,

                transaction_date:
                    transaction_date ||
                    new Date()

            }, {

                transaction

            })


        await transaction.commit()


        if (Notification) {

            await Notification.create({

                user_id:
                    req.user.id,

                type:
                    'saving',

                title:
                    'Tabungan berkurang',

                message:
                    `Withdrawal ${formatRupiah(withdrawAmount)} dari tabungan "${saving.name}".`,

                is_read:
                    false

            })

        }


        return res.status(201).json({

            success:
                true,

            message:
                'Withdrawal berhasil.',

            data: {

                saving,

                transaction:
                    savingTransaction

            }

        })


    } catch (error) {

        try {

            await transaction.rollback()

        } catch {}


        console.error(
            'WITHDRAW SAVING ERROR:',
            error
        )


        return res.status(500).json({

            success:
                false,

            message:
                'Gagal melakukan withdrawal.'

        })

    }

}


/*
|--------------------------------------------------------------------------
| TRANSACTIONS
|--------------------------------------------------------------------------
*/

async function getSavingTransactions(req, res) {

    try {

        const saving =
            await Savings.findOne({

                where: {

                    id:
                        req.params.id,

                    user_id:
                        req.user.id

                },

                attributes: [

                    'id',
                    'name',
                    'type',
                    'target_amount',
                    'current_amount',
                    'routine_amount',
                    'routine_frequency',
                    'routine_day',
                    'target_date',
                    'status'

                ]

            })


        if (!saving) {

            return res.status(404).json({

                success:
                    false,

                message:
                    'Tabungan tidak ditemukan.'

            })

        }


        const transactions =
            await SavingsTransaction.findAll({

                where: {

                    saving_id:
                        saving.id,

                    user_id:
                        req.user.id

                },

                order: [

                    [
                        'transaction_date',
                        'DESC'
                    ],

                    [
                        'id',
                        'DESC'
                    ]

                ]

            })


        return res.json({

            success:
                true,

            data: {

                saving,

                transactions

            }

        })


    } catch (error) {

        console.error(
            'GET SAVING TRANSACTIONS ERROR:',
            error
        )


        return res.status(500).json({

            success:
                false,

            message:
                'Gagal mengambil riwayat tabungan.'

        })

    }

}


/*
|--------------------------------------------------------------------------
| EXPORT
|--------------------------------------------------------------------------
*/

module.exports = {

    getSavings,

    getSaving,

    createSaving,

    updateSaving,

    deleteSaving,

    depositSaving,

    withdrawSaving,

    getSavingTransactions

}