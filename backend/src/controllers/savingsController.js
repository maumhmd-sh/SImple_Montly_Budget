const {
    Savings,
    SavingsTransaction,
    Account,
    Transaction,
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

    const dbTransaction =
        await sequelize.transaction()

    try {

        const {
            name,
            type,
            target_amount,
            initial_amount,
            initial_date,
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
        | NAME
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
        | TYPE
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
                'Tipe tabungan tidak valid.'
            )

        }


        /*
        |--------------------------------------------------------------------------
        | TARGET AMOUNT
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

        }


        /*
        |--------------------------------------------------------------------------
        | INITIAL BALANCE
        |--------------------------------------------------------------------------
        */

        let initialAmount = 0


        if (
            initial_amount !== undefined &&
            initial_amount !== null &&
            initial_amount !== ''
        ) {

            initialAmount =
                toNumber(
                    initial_amount
                )


            if (
                !Number.isFinite(
                    initialAmount
                ) ||
                initialAmount < 0
            ) {

                errors.push(
                    'Saldo awal tidak valid.'
                )

            }

        }


        /*
        |--------------------------------------------------------------------------
        | TARGET VALIDATION
        |--------------------------------------------------------------------------
        */

        if (
            savingType === 'target' &&
            Number.isFinite(target) &&
            Number.isFinite(initialAmount) &&
            initialAmount > target
        ) {

            errors.push(
                'Saldo awal tidak boleh lebih besar dari target tabungan.'
            )

        }


        /*
        |--------------------------------------------------------------------------
        | ROUTINE
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
        | VALIDATION ERROR
        |--------------------------------------------------------------------------
        */

        if (
            errors.length
        ) {

            await dbTransaction.rollback()

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
        | CREATE SAVING
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

                /*
                |--------------------------------------------------------------------------
                | IMPORTANT
                |
                | Saldo awal langsung masuk ke tabungan.
                |
                | TIDAK mengurangi account Cash / Bank / E-Wallet.
                |--------------------------------------------------------------------------
                */

                current_amount:
                    initialAmount,

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
                    (
                        savingType === 'target' &&
                        target > 0 &&
                        initialAmount >= target
                    )
                        ? 'completed'
                        : 'active'

            }, {

                transaction:
                    dbTransaction

            })


        /*
        |--------------------------------------------------------------------------
        | OPENING BALANCE TRANSACTION
        |--------------------------------------------------------------------------
        |
        | Dicatat sebagai riwayat khusus.
        |
        | Tidak dianggap:
        |
        | income
        | expense
        | deposit bulanan
        | transfer dari account
        |--------------------------------------------------------------------------
        */

        if (
            initialAmount > 0
        ) {

            await SavingsTransaction.create({

                user_id:
                    req.user.id,

                saving_id:
                    saving.id,

                type:
                    'opening_balance',

                amount:
                    initialAmount,

                description:
                    'Saldo awal sebelum menggunakan aplikasi.',

                transaction_date:
                    initial_date ||
                    new Date()

            }, {

                transaction:
                    dbTransaction

            })

        }


        /*
        |--------------------------------------------------------------------------
        | NOTIFICATION
        |--------------------------------------------------------------------------
        */

        if (
            Notification
        ) {

            const notificationMessage =
                initialAmount > 0

                    ? `Tabungan "${saving.name}" berhasil dibuat dengan saldo awal ${formatRupiah(initialAmount)}.`

                    : savingType === 'target'

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

            }, {

                transaction:
                    dbTransaction

            })

        }


        /*
        |--------------------------------------------------------------------------
        | COMMIT
        |--------------------------------------------------------------------------
        */

        await dbTransaction.commit()


        return res.status(201).json({

            success:
                true,

            message:
                initialAmount > 0

                    ? 'Tabungan berhasil dibuat dengan saldo awal.'

                    : 'Tabungan berhasil dibuat.',

            data:
                saving

        })


    } catch (error) {

        await dbTransaction.rollback()

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

    const dbTransaction =
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

                transaction:
                    dbTransaction,

                lock:
                    dbTransaction.LOCK.UPDATE

            })


        if (!saving) {

            await dbTransaction.rollback()

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
            initial_amount,
            initial_date,
            routine_amount,
            routine_frequency,
            routine_day,
            target_date,
            description,
            status
        } = req.body


        /*
        |--------------------------------------------------------------------------
        | TYPE
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

                await dbTransaction.rollback()

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
        | NAME
        |--------------------------------------------------------------------------
        */

        if (
            name !== undefined
        ) {

            if (
                !String(name).trim()
            ) {

                await dbTransaction.rollback()

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
        | TARGET
        |--------------------------------------------------------------------------
        */

        if (
            savingType === 'free'
        ) {

            saving.type =
                'free'

            saving.target_amount =
                0


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
                    !Number.isFinite(target) ||
                    target <= 0
                ) {

                    await dbTransaction.rollback()

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

                    await dbTransaction.rollback()

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


            if (
                Number(saving.target_amount) > 0 &&
                Number(saving.current_amount) >=
                    Number(saving.target_amount)
            ) {

                saving.status =
                    'completed'

            }

        }


        /*
        |--------------------------------------------------------------------------
        | SALDO AWAL
        |--------------------------------------------------------------------------
        |
        | Saldo awal bukan deposit biasa.
        |
        | Tidak mempengaruhi account.
        | Tidak membuat Transaction transfer.
        |
        | Hanya mengubah current_amount berdasarkan
        | selisih saldo awal lama dan saldo awal baru.
        |
        |--------------------------------------------------------------------------
        */

        if (
            initial_amount !== undefined ||
            initial_date !== undefined
        ) {

            const openingTransaction =
                await SavingsTransaction.findOne({

                    where: {

                        saving_id:
                            saving.id,

                        user_id:
                            req.user.id,

                        type:
                            'opening_balance'

                    },

                    order: [
                        [
                            'id',
                            'ASC'
                        ]
                    ],

                    transaction:
                        dbTransaction,

                    lock:
                        dbTransaction.LOCK.UPDATE

                })


            const oldOpeningAmount =
                openingTransaction
                    ? Number(
                        openingTransaction.amount
                    )
                    : 0


            let newOpeningAmount =
                oldOpeningAmount


            /*
            |--------------------------------------------------------------------------
            | UPDATE NOMINAL SALDO AWAL
            |--------------------------------------------------------------------------
            */

            if (
                initial_amount !== undefined
            ) {

                newOpeningAmount =
                    toNumber(
                        initial_amount
                    )


                if (
                    !Number.isFinite(
                        newOpeningAmount
                    ) ||
                    newOpeningAmount < 0
                ) {

                    await dbTransaction.rollback()

                    return res.status(400).json({

                        success:
                            false,

                        message:
                            'Saldo awal tidak valid.'

                    })

                }


                /*
                |------------------------------------------------------------------
                | TARGET VALIDATION
                |------------------------------------------------------------------
                */

                if (
                    savingType === 'target' &&
                    Number(saving.target_amount) > 0 &&
                    newOpeningAmount >
                        Number(saving.target_amount)
                ) {

                    await dbTransaction.rollback()

                    return res.status(400).json({

                        success:
                            false,

                        message:
                            'Saldo awal tidak boleh lebih besar dari target tabungan.'

                    })

                }


                /*
                |------------------------------------------------------------------
                | CURRENT AMOUNT
                |------------------------------------------------------------------
                */

                const difference =
                    newOpeningAmount -
                    oldOpeningAmount


                const newCurrentAmount =
                    Number(
                        saving.current_amount
                    ) +
                    difference


                /*
                |------------------------------------------------------------------
                | JANGAN BOLEH NEGATIF
                |------------------------------------------------------------------
                */

                if (
                    newCurrentAmount < 0
                ) {

                    await dbTransaction.rollback()

                    return res.status(400).json({

                        success:
                            false,

                        message:
                            'Saldo awal baru terlalu kecil karena saldo tabungan saat ini sudah digunakan oleh transaksi sebelumnya.'

                    })

                }


                saving.current_amount =
                    newCurrentAmount


                /*
                |------------------------------------------------------------------
                | UPDATE / CREATE / DELETE OPENING TRANSACTION
                |------------------------------------------------------------------
                */

                if (
                    newOpeningAmount > 0
                ) {

                    if (
                        openingTransaction
                    ) {

                        openingTransaction.amount =
                            newOpeningAmount

                        openingTransaction.description =
                            'Saldo awal sebelum menggunakan aplikasi.'

                        if (
                            initial_date !== undefined
                        ) {

                            openingTransaction.transaction_date =
                                initial_date ||
                                new Date()

                        }


                        await openingTransaction.save({

                            transaction:
                                dbTransaction

                        })

                    } else {

                        await SavingsTransaction.create({

                            user_id:
                                req.user.id,

                            saving_id:
                                saving.id,

                            type:
                                'opening_balance',

                            amount:
                                newOpeningAmount,

                            description:
                                'Saldo awal sebelum menggunakan aplikasi.',

                            transaction_date:
                                initial_date ||
                                new Date()

                        }, {

                            transaction:
                                dbTransaction

                        })

                    }

                } else {

                    /*
                    |----------------------------------------------------------------
                    | Jika saldo awal menjadi 0,
                    | hapus transaksi opening_balance.
                    |----------------------------------------------------------------
                    */

                    if (
                        openingTransaction
                    ) {

                        await openingTransaction.destroy({

                            transaction:
                                dbTransaction

                        })

                    }

                }

            } else {

                /*
                |--------------------------------------------------------------------------
                | HANYA UPDATE TANGGAL
                |--------------------------------------------------------------------------
                */

                if (
                    openingTransaction &&
                    initial_date !== undefined
                ) {

                    openingTransaction.transaction_date =
                        initial_date ||
                        new Date()


                    await openingTransaction.save({

                        transaction:
                            dbTransaction

                    })

                }

            }


            /*
            |--------------------------------------------------------------------------
            | RECALCULATE STATUS
            |--------------------------------------------------------------------------
            */

            if (
                saving.type === 'target' &&
                Number(saving.target_amount) > 0 &&
                Number(saving.current_amount) >=
                    Number(saving.target_amount)
            ) {

                saving.status =
                    'completed'

            } else if (
                saving.status === 'completed' &&
                (
                    saving.type === 'free' ||
                    Number(saving.current_amount) <
                        Number(saving.target_amount)
                )
            ) {

                saving.status =
                    'active'

            }

        }


        /*
        |--------------------------------------------------------------------------
        | ROUTINE
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

            await dbTransaction.rollback()

            return res.status(400).json({

                success:
                    false,

                message:
                    'Data tabungan rutin tidak valid.',

                errors:
                    routine.errors

            })

        }


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
        | TARGET DATE
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
        | DESCRIPTION
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
        | STATUS
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

                await dbTransaction.rollback()

                return res.status(400).json({

                    success:
                        false,

                    message:
                        'Status tabungan tidak valid.'

                })

            }


            if (
                savingType === 'free' &&
                status === 'completed'
            ) {

                await dbTransaction.rollback()

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


        /*
        |--------------------------------------------------------------------------
        | SAVE
        |--------------------------------------------------------------------------
        */

        await saving.save({

            transaction:
                dbTransaction

        })


        /*
        |--------------------------------------------------------------------------
        | COMMIT
        |--------------------------------------------------------------------------
        */

        await dbTransaction.commit()


        return res.json({

            success:
                true,

            message:
                'Tabungan berhasil diperbarui.',

            data:
                saving

        })


    } catch (error) {

        try {

            await dbTransaction.rollback()

        } catch {}


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

    const dbTransaction =
        await sequelize.transaction()

    try {

        const {
            account_id,
            amount,
            description,
            transaction_date
        } = req.body


        const depositAmount =
            toNumber(amount)

        const accountId =
            Number(account_id)


        if (
            !Number.isFinite(depositAmount) ||
            depositAmount <= 0
        ) {

            await dbTransaction.rollback()

            return res.status(400).json({
                success: false,
                message: 'Nominal deposit tidak valid.'
            })

        }


        if (
            !Number.isInteger(accountId) ||
            accountId <= 0
        ) {

            await dbTransaction.rollback()

            return res.status(400).json({
                success: false,
                message: 'Account sumber wajib dipilih.'
            })

        }


        const saving =
            await Savings.findOne({
                where: {
                    id: req.params.id,
                    user_id: req.user.id
                },
                transaction: dbTransaction,
                lock: dbTransaction.LOCK.UPDATE
            })


        if (!saving) {

            await dbTransaction.rollback()

            return res.status(404).json({
                success: false,
                message: 'Tabungan tidak ditemukan.'
            })

        }


        if (saving.status === 'cancelled') {

            await dbTransaction.rollback()

            return res.status(400).json({
                success: false,
                message: 'Tabungan sudah dibatalkan.'
            })

        }


        const account =
            await Account.findOne({
                where: {
                    id: accountId,
                    user_id: req.user.id
                },
                transaction: dbTransaction,
                lock: dbTransaction.LOCK.UPDATE
            })


        if (!account) {

            await dbTransaction.rollback()

            return res.status(404).json({
                success: false,
                message: 'Account sumber tidak ditemukan.'
            })

        }


        const accountBalance =
            Number(account.balance)


        if (depositAmount > accountBalance) {

            await dbTransaction.rollback()

            return res.status(400).json({
                success: false,
                message:
                    'Saldo account tidak mencukupi untuk melakukan transfer ke tabungan.'
            })

        }


        const currentSavingAmount =
            Number(saving.current_amount)

        const newSavingAmount =
            currentSavingAmount +
            depositAmount


        /*
        |--------------------------------------------------------------------------
        | UPDATE SALDO
        |--------------------------------------------------------------------------
        */

        account.balance =
            accountBalance -
            depositAmount


        saving.current_amount =
            newSavingAmount


        /*
        |--------------------------------------------------------------------------
        | AUTO COMPLETED TARGET
        |--------------------------------------------------------------------------
        */

        if (
            saving.type === 'target' &&
            Number(saving.target_amount) > 0 &&
            newSavingAmount >=
                Number(saving.target_amount)
        ) {

            saving.status =
                'completed'

        }


        await account.save({
            transaction:
                dbTransaction
        })


        await saving.save({
            transaction:
                dbTransaction
        })


        const normalizedDescription =
            description
                ? String(description).trim()
                : null


        const transactionDate =
            transaction_date ||
            new Date()


        /*
        |--------------------------------------------------------------------------
        | SAVINGS TRANSACTION
        |--------------------------------------------------------------------------
        */

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
                    normalizedDescription,

                transaction_date:
                    transactionDate

            }, {
                transaction:
                    dbTransaction
            })


        /*
        |--------------------------------------------------------------------------
        | MAIN TRANSACTION
        |
        | PENTING:
        | Ini bukan expense.
        | Ini transfer dari account ke tabungan.
        |--------------------------------------------------------------------------
        */

        const transferTransaction =
            await Transaction.create({

                user_id:
                    req.user.id,

                category_id:
                    null,

                account_id:
                    account.id,

                saving_id:
                    saving.id,

                type:
                    'transfer',

                amount:
                    depositAmount,

                description:
                    normalizedDescription ||
                    `Transfer ke tabungan ${saving.name}`,

                transaction_date:
                    transactionDate

            }, {
                transaction:
                    dbTransaction
            })


        /*
        |--------------------------------------------------------------------------
        | COMMIT
        |--------------------------------------------------------------------------
        */

        await dbTransaction.commit()


        /*
        |--------------------------------------------------------------------------
        | NOTIFICATION
        |--------------------------------------------------------------------------
        */

        if (Notification) {

            await Notification.create({

                user_id:
                    req.user.id,

                type:
                    'saving',

                title:
                    'Tabungan bertambah',

                message:
                    `${formatRupiah(depositAmount)} dipindahkan dari account "${account.name}" ke tabungan "${saving.name}".`,

                is_read:
                    false

            })

        }


        return res.status(201).json({

            success:
                true,

            message:
                'Transfer ke tabungan berhasil.',

            data: {

                saving,

                account,

                saving_transaction:
                    savingTransaction,

                transaction:
                    transferTransaction

            }

        })


    } catch (error) {

        try {

            await dbTransaction.rollback()

        } catch {}


        console.error(
            'DEPOSIT SAVING ERROR:',
            error
        )


        return res.status(500).json({

            success:
                false,

            message:
                'Gagal melakukan deposit.'

        })

    }

}

/*
|--------------------------------------------------------------------------
| WITHDRAW
|--------------------------------------------------------------------------
*/

async function withdrawSaving(req, res) {

    const dbTransaction =
        await sequelize.transaction()

    try {

        const {
            account_id,
            amount,
            description,
            transaction_date
        } = req.body


        const withdrawAmount =
            toNumber(amount)

        const accountId =
            Number(account_id)


        /*
        |--------------------------------------------------------------------------
        | VALIDASI NOMINAL
        |--------------------------------------------------------------------------
        */

        if (
            !Number.isFinite(withdrawAmount) ||
            withdrawAmount <= 0
        ) {

            await dbTransaction.rollback()

            return res.status(400).json({

                success:
                    false,

                message:
                    'Nominal withdrawal tidak valid.'

            })

        }


        /*
        |--------------------------------------------------------------------------
        | VALIDASI ACCOUNT
        |--------------------------------------------------------------------------
        */

        if (
            !Number.isInteger(accountId) ||
            accountId <= 0
        ) {

            await dbTransaction.rollback()

            return res.status(400).json({

                success:
                    false,

                message:
                    'Account tujuan wajib dipilih.'

            })

        }


        /*
        |--------------------------------------------------------------------------
        | GET SAVING
        |--------------------------------------------------------------------------
        */

        const saving =
            await Savings.findOne({

                where: {

                    id:
                        req.params.id,

                    user_id:
                        req.user.id

                },

                transaction:
                    dbTransaction,

                lock:
                    dbTransaction.LOCK.UPDATE

            })


        if (!saving) {

            await dbTransaction.rollback()

            return res.status(404).json({

                success:
                    false,

                message:
                    'Tabungan tidak ditemukan.'

            })

        }


        /*
        |--------------------------------------------------------------------------
        | GET ACCOUNT
        |--------------------------------------------------------------------------
        */

        const account =
            await Account.findOne({

                where: {

                    id:
                        accountId,

                    user_id:
                        req.user.id

                },

                transaction:
                    dbTransaction,

                lock:
                    dbTransaction.LOCK.UPDATE

            })


        if (!account) {

            await dbTransaction.rollback()

            return res.status(404).json({

                success:
                    false,

                message:
                    'Account tujuan tidak ditemukan.'

            })

        }


        /*
        |--------------------------------------------------------------------------
        | VALIDASI SALDO TABUNGAN
        |--------------------------------------------------------------------------
        */

        const currentSavingAmount =
            Number(
                saving.current_amount
            )


        if (
            withdrawAmount >
            currentSavingAmount
        ) {

            await dbTransaction.rollback()

            return res.status(400).json({

                success:
                    false,

                message:
                    'Saldo tabungan tidak mencukupi.'

            })

        }


        /*
        |--------------------------------------------------------------------------
        | UPDATE SALDO
        |--------------------------------------------------------------------------
        */

        saving.current_amount =
            currentSavingAmount -
            withdrawAmount


        account.balance =
            Number(account.balance) +
            withdrawAmount


        /*
        |--------------------------------------------------------------------------
        | TARGET STATUS
        |--------------------------------------------------------------------------
        */

        if (
            saving.type === 'target' &&
            saving.status === 'completed' &&
            Number(saving.current_amount) <
                Number(saving.target_amount)
        ) {

            saving.status =
                'active'

        }


        await saving.save({

            transaction:
                dbTransaction

        })


        await account.save({

            transaction:
                dbTransaction

        })


        const normalizedDescription =
            description
                ? String(description).trim()
                : null


        const transactionDate =
            transaction_date ||
            new Date()


        /*
        |--------------------------------------------------------------------------
        | SAVINGS TRANSACTION
        |--------------------------------------------------------------------------
        */

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
                    normalizedDescription,

                transaction_date:
                    transactionDate

            }, {

                transaction:
                    dbTransaction

            })


        /*
        |--------------------------------------------------------------------------
        | MAIN TRANSACTION
        |
        | Ini juga transfer,
        | bukan income.
        |--------------------------------------------------------------------------
        */

        const transferTransaction =
            await Transaction.create({

                user_id:
                    req.user.id,

                category_id:
                    null,

                account_id:
                    account.id,

                saving_id:
                    saving.id,

                type:
                    'transfer',

                amount:
                    withdrawAmount,

                description:
                    normalizedDescription ||
                    `Transfer dari tabungan ${saving.name}`,

                transaction_date:
                    transactionDate

            }, {

                transaction:
                    dbTransaction

            })


        /*
        |--------------------------------------------------------------------------
        | COMMIT
        |--------------------------------------------------------------------------
        */

        await dbTransaction.commit()


        /*
        |--------------------------------------------------------------------------
        | NOTIFICATION
        |--------------------------------------------------------------------------
        */

        if (Notification) {

            await Notification.create({

                user_id:
                    req.user.id,

                type:
                    'saving',

                title:
                    'Tabungan berkurang',

                message:
                    `${formatRupiah(withdrawAmount)} dipindahkan dari tabungan "${saving.name}" ke account "${account.name}".`,

                is_read:
                    false

            })

        }


        return res.status(201).json({

            success:
                true,

            message:
                'Transfer dari tabungan berhasil.',

            data: {

                saving,

                account,

                saving_transaction:
                    savingTransaction,

                transaction:
                    transferTransaction

            }

        })


    } catch (error) {

        try {

            await dbTransaction.rollback()

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