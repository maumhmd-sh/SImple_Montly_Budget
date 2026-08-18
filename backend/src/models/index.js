const User = require('./User')
const Category = require('./Category')
const Account = require('./Account')
const Transaction = require('./Transaction')
const MonthlyBudget = require('./MonthlyBudget')
const Notification = require('./Notification')

/*
|--------------------------------------------------------------------------
| User Relations
|--------------------------------------------------------------------------
*/

User.hasMany(Category, {
    foreignKey: 'user_id',
    as: 'categories',
    onDelete: 'CASCADE',
    hooks: true
})

Category.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
})


User.hasMany(Account, {
    foreignKey: 'user_id',
    as: 'accounts',
    onDelete: 'CASCADE',
    hooks: true
})

Account.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
})


User.hasMany(Transaction, {
    foreignKey: 'user_id',
    as: 'transactions',
    onDelete: 'CASCADE',
    hooks: true
})

Transaction.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
})


User.hasMany(MonthlyBudget, {
    foreignKey: 'user_id',
    as: 'budgets',
    onDelete: 'CASCADE',
    hooks: true
})

MonthlyBudget.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
})

User.hasMany(Notification, {
    foreignKey: 'user_id',
    as: 'notifications',
    onDelete: 'CASCADE',
    hooks: true
})

Notification.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
})


/*
|--------------------------------------------------------------------------
| Category Relations
|--------------------------------------------------------------------------
*/

Category.hasMany(Transaction, {
    foreignKey: 'category_id',
    as: 'transactions'
})

Transaction.belongsTo(Category, {
    foreignKey: 'category_id',
    as: 'category'
})


Category.hasMany(MonthlyBudget, {
    foreignKey: 'category_id',
    as: 'budgets'
})

MonthlyBudget.belongsTo(Category, {
    foreignKey: 'category_id',
    as: 'category'
})


/*
|--------------------------------------------------------------------------
| Account Relations
|--------------------------------------------------------------------------
*/

Account.hasMany(Transaction, {
    foreignKey: 'account_id',
    as: 'transactions'
})

Transaction.belongsTo(Account, {
    foreignKey: 'account_id',
    as: 'account'
})


module.exports = {
    User,
    Category,
    Account,
    Transaction,
    MonthlyBudget,
    Notification
}