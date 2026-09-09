const express = require('express')

const router =
    express.Router()

const {
    getSavings,
    getSaving,
    createSaving,
    updateSaving,
    deleteSaving,
    depositSaving,
    withdrawSaving,
    getSavingTransactions
} = require('../controllers/savingsController')


const authMiddleware =
    require('../middleware/authMiddleware')


router.use(
    authMiddleware
)


router.get(
    '/',
    getSavings
)


router.post(
    '/',
    createSaving
)


router.get(
    '/:id',
    getSaving
)


router.put(
    '/:id',
    updateSaving
)


router.delete(
    '/:id',
    deleteSaving
)


router.post(
    '/:id/deposit',
    depositSaving
)


router.post(
    '/:id/withdraw',
    withdrawSaving
)


router.get(
    '/:id/transactions',
    getSavingTransactions
)


module.exports = router