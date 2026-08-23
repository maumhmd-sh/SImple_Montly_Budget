require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sequelize = require("./config/sequelize");

const { Op } = require("sequelize");

const categoryRoutes =
    require("./routes/categoryRoutes");

const savingsRoutes =
    require("./routes/savingsRoutes");

const {
    User,
    Category,
    Account,
    Transaction,
    MonthlyBudget,
    Notification
} = require("./models");

const app = express();


/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/

app.use(
    cors({
        origin: "http://localhost:5173"
    })
);

app.use(express.json());


/*
|--------------------------------------------------------------------------
| Category API
|--------------------------------------------------------------------------
*/

app.use(
    "/api/categories",
    categoryRoutes
);

app.use(
    "/api/savings",
    savingsRoutes
);

function generateToken(user) {

    return jwt.sign(
        {
            id: user.id,
            name: user.name,
            email: user.email
        },

        process.env.JWT_SECRET,

        {
            expiresIn: "7d"
        }
    );
}


function auth(req, res, next) {

    try {

        const header =
            req.headers.authorization || "";

        if (!header.startsWith("Bearer ")) {
            throw new Error();
        }

        const token =
            header.substring(7);

        req.user =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );

        next();

    } catch {

        return res.status(401).json({
            message:
                "Session tidak valid."
        });
    }
}


// ============================================================
// GET NOTIFICATIONS
// ============================================================

app.get(
    "/api/notifications",
    auth,
    async (req, res) => {

        try {

            const notifications =
                await Notification.findAll({

                    where: {
                        user_id: req.user.id
                    },

                    order: [
                        [
                            "created_at",
                            "DESC"
                        ]
                    ],

                    limit: 30

                });


            return res.json({

                success: true,

                notifications

            });

        } catch (error) {

            console.error(
                "GET /api/notifications:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Gagal mengambil notifikasi."

            });

        }

    }
);

// ============================================================
// GET UNREAD NOTIFICATION COUNT
// ============================================================

app.get(
    "/api/notifications/unread-count",
    auth,
    async (req, res) => {

        try {

            const count =
                await Notification.count({

                    where: {

                        user_id:
                            req.user.id,

                        is_read:
                            false

                    }

                });


            return res.json({

                success: true,

                count

            });

        } catch (error) {

            console.error(
                "GET /api/notifications/unread-count:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Gagal mengambil jumlah notifikasi."

            });

        }

    }
);

// ============================================================
// MARK NOTIFICATION AS READ
// ============================================================

app.put(
    "/api/notifications/:id/read",
    auth,
    async (req, res) => {

        try {

            const notification =
                await Notification.findOne({

                    where: {

                        id:
                            req.params.id,

                        user_id:
                            req.user.id

                    }

                });


            if (!notification) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Notifikasi tidak ditemukan."

                });

            }


            notification.is_read =
                true;


            await notification.save();


            return res.json({

                success: true,

                message:
                    "Notifikasi ditandai sudah dibaca."

            });

        } catch (error) {

            console.error(
                "PUT /api/notifications/:id/read:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Gagal memperbarui notifikasi."

            });

        }

    }
);

// ============================================================
// MARK ALL NOTIFICATIONS AS READ
// ============================================================

app.put(
    "/api/notifications/read-all",
    auth,
    async (req, res) => {

        try {

            await Notification.update(

                {
                    is_read: true
                },

                {
                    where: {

                        user_id:
                            req.user.id,

                        is_read:
                            false

                    }
                }

            );


            return res.json({

                success: true,

                message:
                    "Semua notifikasi sudah dibaca."

            });

        } catch (error) {

            console.error(
                "PUT /api/notifications/read-all:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Gagal menandai semua notifikasi."

            });

        }

    }
);
// ============================================================
// CREATE NOTIFICATION
// ============================================================

async function createNotification({

    userId,

    type = "system",

    title,

    message

}) {

    try {

        if (
            !userId ||
            !title ||
            !message
        ) {

            return null;

        }


        return await Notification.create({

            user_id: userId,

            type,

            title,

            message,

            is_read: false

        });

    } catch (error) {

        console.error(
            "CREATE NOTIFICATION ERROR:",
            error
        );

        return null;

    }

}

function getMonthRange(month) {

    const [year, monthNumber] =
        month.split("-").map(Number);

    const lastDay =
        new Date(
            Date.UTC(
                year,
                monthNumber,
                0
            )
        ).getUTCDate();

    return {
        start:
            `${year}-${String(monthNumber).padStart(2, "0")}-01`,

        end:
            `${year}-${String(monthNumber).padStart(2, "0")}-${lastDay}`
    };
}


function sumRows(rows) {

    return rows.reduce(
        (total, row) =>
            total + Number(row.amount || 0),
        0
    );
}


function validateTransactionInput(req, type) {
    const {
        category_id,
        account_id,
        amount,
        description,
        transaction_date
    } = req.body;

    const errors = [];

    const categoryId = Number(category_id);
    const accountId = Number(account_id);
    const transactionAmount = Number(amount);

    if (
        category_id === undefined ||
        category_id === null ||
        category_id === "" ||
        !Number.isInteger(categoryId) ||
        categoryId <= 0
    ) {
        errors.push("category_id harus berupa ID yang valid.");
    }

    if (
        account_id === undefined ||
        account_id === null ||
        account_id === "" ||
        !Number.isInteger(accountId) ||
        accountId <= 0
    ) {
        errors.push("account_id harus berupa ID yang valid.");
    }

    if (
        amount === undefined ||
        amount === null ||
        amount === "" ||
        !Number.isFinite(transactionAmount) ||
        transactionAmount <= 0
    ) {
        errors.push("amount harus berupa angka lebih dari 0.");
    }

    if (
        transaction_date === undefined ||
        transaction_date === null ||
        transaction_date === ""
    ) {
        errors.push("transaction_date wajib diisi.");
    } else if (
        !/^\d{4}-\d{2}-\d{2}$/.test(transaction_date)
    ) {
        errors.push(
            "transaction_date harus menggunakan format YYYY-MM-DD."
        );
    } else {
        const date = new Date(
            `${transaction_date}T00:00:00Z`
        );

        if (
            Number.isNaN(date.getTime()) ||
            date.toISOString().slice(0, 10) !== transaction_date
        ) {
            errors.push(
                "transaction_date tidak valid."
            );
        }
    }

    if (
        description !== undefined &&
        description !== null &&
        typeof description !== "string"
    ) {
        errors.push(
            "description harus berupa teks."
        );
    }

    if (
        typeof description === "string" &&
        description.length > 255
    ) {
        errors.push(
            "description maksimal 255 karakter."
        );
    }

    if (
        type !== "income" &&
        type !== "expense"
    ) {
        errors.push(
            "Tipe transaksi tidak valid."
        );
    }

    return errors;
}

/*
|--------------------------------------------------------------------------
| Health
|--------------------------------------------------------------------------
*/

app.get(
    "/api/health",
    (req, res) => {

        res.json({
            success: true,
            message: "Monthly Budget API running"
        });

    }
);


/*
|--------------------------------------------------------------------------
| REGISTER
|--------------------------------------------------------------------------
*/

app.post(
    "/api/auth/register",
    async (req, res) => {

        try {

            const {
                name,
                email,
                password
            } = req.body;


            if (
                !name ||
                !email ||
                !password
            ) {

                return res.status(400).json({
                    message:
                        "Nama, email, dan password wajib diisi."
                });

            }


            if (password.length < 6) {

                return res.status(400).json({
                    message:
                        "Password minimal 6 karakter."
                });

            }


            const exists =
                await User.findOne({
                    where: { email }
                });


            if (exists) {

                return res.status(409).json({
                    message:
                        "Email sudah terdaftar."
                });

            }


            const passwordHash =
                await bcrypt.hash(
                    password,
                    12
                );


            const user =
                await User.create({
                    name,
                    email,
                    password_hash:
                        passwordHash
                });


            /*
            |--------------------------------------------------------------------------
            | Default Categories
            |--------------------------------------------------------------------------
            */

            const categories = [

                [
                    "Gaji",
                    "income",
                    "bi-wallet2"
                ],

                [
                    "Freelance",
                    "income",
                    "bi-briefcase"
                ],

                [
                    "Bonus",
                    "income",
                    "bi-gift"
                ],

                [
                    "Makanan",
                    "expense",
                    "bi-cup-hot"
                ],

                [
                    "Transportasi",
                    "expense",
                    "bi-car-front"
                ],

                [
                    "Tagihan",
                    "expense",
                    "bi-receipt"
                ],

                [
                    "Belanja",
                    "expense",
                    "bi-bag"
                ],

                [
                    "Hiburan",
                    "expense",
                    "bi-controller"
                ],

                [
                    "Kesehatan",
                    "expense",
                    "bi-heart-pulse"
                ],

                [
                    "Pendidikan",
                    "expense",
                    "bi-book"
                ],

                [
                    "Lainnya",
                    "expense",
                    "bi-three-dots"
                ]
            ];


            await Category.bulkCreate(

                categories.map(
                    item => ({
                        user_id: user.id,
                        name: item[0],
                        type: item[1],
                        icon: item[2]
                    })
                )

            );


            /*
            |--------------------------------------------------------------------------
            | Default Accounts
            |--------------------------------------------------------------------------
            */

            await Account.bulkCreate([

                {
                    user_id: user.id,
                    name: "Cash",
                    type: "cash"
                },

                {
                    user_id: user.id,
                    name: "Bank Utama",
                    type: "bank"
                },

                {
                    user_id: user.id,
                    name: "E-Wallet",
                    type: "ewallet"
                }

            ]);


            res.status(201).json({

                token:
                    generateToken(user),

                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                message:
                    "Gagal membuat akun."
            });

        }

    }
);


/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/

app.post(
    "/api/auth/login",
    async (req, res) => {

        try {

            const {
                email,
                password
            } = req.body;


            const user =
                await User.findOne({
                    where: { email }
                });


            if (
                !user ||
                !await bcrypt.compare(
                    password || "",
                    user.password_hash
                )
            ) {

                return res.status(401).json({
                    message:
                        "Email atau password salah."
                });

            }


            res.json({

                token:
                    generateToken(user),

                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }

            });

        } catch (error) {

            res.status(500).json({
                message:
                    "Gagal login."
            });

        }

    }
);


/*
|--------------------------------------------------------------------------
| CURRENT USER
|--------------------------------------------------------------------------
*/

app.get(
    "/api/auth/me",
    auth,
    async (req, res) => {

        try {

            const user =
                await User.findByPk(
                    req.user.id
                )

            if (!user) {

                return res.status(404).json({
                    message:
                        "User tidak ditemukan."
                })

            }

            res.json({

                user: {

                    id:
                        user.id,

                    name:
                        user.name,

                    email:
                        user.email,

                    theme:
                        user.theme,

                    accentColor:
                        user.accent_color

                }

            })

        } catch (error) {

            console.error(
                "GET /api/auth/me ERROR:",
                error
            )

            res.status(500).json({

                message:
                    "Gagal mengambil data user."

            })

        }

    }
)

// ============================================================
// UPDATE PROFILE
// ============================================================

app.put(
    "/api/auth/profile",
    auth,
    async (req, res) => {

        try {

            const {
    name,
    email,
    theme,
    accentColor
} = req.body;


            if (
                typeof name !== "string" ||
                !name.trim()
            ) {

                return res.status(400).json({
                    success: false,
                    message: "Nama wajib diisi."
                });

            }


            if (
                typeof email !== "string" ||
                !email.trim()
            ) {

                return res.status(400).json({
                    success: false,
                    message: "Email wajib diisi."
                });

            }


            const normalizedName =
                name.trim();


            const normalizedEmail =
                email
                    .trim()
                    .toLowerCase();


            const existingUser =
                await User.findOne({
                    where: {
                        email: normalizedEmail,
                        id: {
                            [Op.ne]: req.user.id
                        }
                    }
                });


            if (existingUser) {

                return res.status(409).json({
                    success: false,
                    message: "Email sudah digunakan."
                });

            }


            const user =
                await User.findByPk(
                    req.user.id
                );


            if (!user) {

                return res.status(404).json({
                    success: false,
                    message: "User tidak ditemukan."
                });

            }


            user.name =
                normalizedName;


            user.email =
                normalizedEmail;

                await user.save();

                await createNotification({

    userId:
        req.user.id,

    type:
        "profile",

    title:
        "Profile diperbarui",

    message:
        "Profile berhasil diperbarui."

});

// ========================================
// THEME
// ========================================

if (
    typeof theme === "string" &&
    [
        "light",
        "dark",
        "system"
    ].includes(theme)
) {

    user.theme =
        theme;

}


// ========================================
// ACCENT COLOR
// ========================================

if (
    typeof accentColor === "string" &&
    [
        "blue",
        "purple",
        "green",
        "orange",
        "red",
        "pink"
    ].includes(accentColor)
) {

    user.accent_color =
        accentColor;

}

            await user.save();


return res.json({

    success: true,

    message:
        "Profile berhasil diperbarui.",

    user: {

        id:
            user.id,

        name:
            user.name,

        email:
            user.email,

        theme:
            user.theme,

        accentColor:
            user.accent_color

    }

});

        } catch (error) {

            console.error(
                "UPDATE PROFILE ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Gagal memperbarui profile."

            });

        }

    }
);


// ============================================================
// CHANGE PASSWORD
// ============================================================

app.put(
    "/api/auth/password",
    auth,
    async (req, res) => {

        try {

            const {
                currentPassword,
                newPassword,
                confirmPassword
            } = req.body;


            if (
                !currentPassword ||
                !newPassword ||
                !confirmPassword
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Semua field password wajib diisi."

                });

            }


            if (
                newPassword.length < 6
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Password baru minimal 6 karakter."

                });

            }


            if (
                newPassword !==
                confirmPassword
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Konfirmasi password tidak cocok."

                });

            }


            const user =
                await User.findByPk(
                    req.user.id
                );


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User tidak ditemukan."

                });

            }


            const passwordValid =
                await bcrypt.compare(
                    currentPassword,
                    user.password_hash
                );


            if (!passwordValid) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Password saat ini salah."

                });

            }


            const passwordHash =
                await bcrypt.hash(
                    newPassword,
                    10
                );


            user.password_hash =
                passwordHash;


            await user.save();

            await createNotification({

    userId:
        req.user.id,

    type:
        "password",

    title:
        "Password diubah",

    message:
        "Password berhasil diubah."

});


            return res.json({

                success: true,

                message:
                    "Password berhasil diperbarui."

            });

        } catch (error) {

            console.error(
                "CHANGE PASSWORD ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Gagal memperbarui password."

            });

        }

    }
);

/*
|--------------------------------------------------------------------------
| ACCOUNTS
|--------------------------------------------------------------------------
*/

// -----------------------------
app.get(
    "/api/accounts",
    auth,
    async (req, res) => {

        try {

            const accounts =
                await Account.findAll({

                    where: {
                        user_id:
                            req.user.id
                    },

                    order: [
                        ["name", "ASC"]
                    ]

                });

            return res.json(
                accounts
            );

        } catch (error) {

            console.error(
                "GET /api/accounts:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Gagal mengambil account."
            });

        }

    }
);
// -----------------------------


app.post(
    "/api/accounts",
    auth,
    async (req, res) => {

        try {

            const {
                name,
                type
            } = req.body;


            if (
                typeof name !== "string" ||
                !name.trim()
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Nama account wajib diisi."
                });

            }


            const allowedTypes = [
                "cash",
                "bank",
                "ewallet"
            ];


            if (!allowedTypes.includes(type)) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Tipe account tidak valid."
                });

            }


const account =
    await Account.create({

        user_id:
            req.user.id,

        name:
            name.trim(),

        type,

        balance: 0

    });


await createNotification({

    userId:
        req.user.id,

    type:
        "account",

    title:
        "Account ditambahkan",

    message:
        `Account "${account.name}" berhasil ditambahkan.`

});


return res.status(201).json(
    account
);


            return res.status(201).json(
                account
            );


        } catch (error) {

            console.error(
                "POST /api/accounts:",
                error
            );


            return res.status(500).json({
                success: false,
                message:
                    "Gagal membuat account."
            });

        }

    }
);


app.put(
    "/api/accounts/:id",
    auth,
    async (req, res) => {

        try {

            const account =
                await Account.findOne({

                    where: {
                        id: req.params.id,
                        user_id:
                            req.user.id
                    }

                });


            if (!account) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Account tidak ditemukan."
                });

            }


            const {
                name,
                type
            } = req.body;


            if (
                typeof name !== "string" ||
                !name.trim()
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Nama account wajib diisi."
                });

            }


            const allowedTypes = [
                "cash",
                "bank",
                "ewallet"
            ];


            if (!allowedTypes.includes(type)) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Tipe account tidak valid."
                });

            }


            await account.update({

                name:
                    name.trim(),

                type

            });


            return res.json({

                success: true,

                message:
                    "Account berhasil diperbarui.",

                data: account

            });


        } catch (error) {

            console.error(
                "PUT /api/accounts/:id:",
                error
            );


            return res.status(500).json({
                success: false,
                message:
                    "Gagal memperbarui account."
            });

        }

    }
);


app.delete(
    "/api/accounts/:id",
    auth,
    async (req, res) => {

        try {

            const account =
                await Account.findOne({

                    where: {
                        id: req.params.id,
                        user_id:
                            req.user.id
                    }

                });


            if (!account) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Account tidak ditemukan."
                });

            }


            const transactionCount =
                await Transaction.count({

                    where: {
                        account_id:
                            account.id,

                        user_id:
                            req.user.id
                    }

                });


            if (transactionCount > 0) {

                return res.status(409).json({

                    success: false,

                    message:
                        "Account tidak dapat dihapus karena masih memiliki transaksi.",

                    transaction_count:
                        transactionCount

                });

            }


            await account.destroy();


            return res.json({

                success: true,

                message:
                    "Account berhasil dihapus."

            });


        } catch (error) {

            console.error(
                "DELETE /api/accounts/:id:",
                error
            );


            return res.status(500).json({
                success: false,
                message:
                    "Gagal menghapus account."
            });

        }

    }
);


app.get(
    "/api/incomes",
    auth,
    async (req, res) => {

        try {

            const where = {
                user_id: req.user.id,
                type: "income"
            };


            if (req.query.month) {

                const range =
                    getMonthRange(
                        req.query.month
                    );

                where.transaction_date = {
                    [Op.between]: [
                        range.start,
                        range.end
                    ]
                };

            }


            const incomes =
    await Transaction.findAll({

        where,

        include: [
            {
                model: Category,
                as: "category"
            },
            {
                model: Account,
                as: "account"
            }
        ],

        order: [
            ["transaction_date", "DESC"],
            ["id", "DESC"]
        ]

    });


res.json(incomes);

} catch (error) {

    console.error(
        "GET /api/incomes:",
        error
    );

    res.status(500).json({
        success: false,
        message:
            "Gagal mengambil data pemasukan."
    });

}

}
);




/*
|--------------------------------------------------------------------------
| ADD INCOME
|--------------------------------------------------------------------------
*/

app.post(
    "/api/incomes",
    auth,
    async (req, res) => {

        const errors =
            validateTransactionInput(
                req,
                "income"
            );

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Data pemasukan tidak valid.",
                errors
            });
        }

        const transaction =
            await sequelize.transaction();

        try {

            const account =
                await Account.findOne({

                    where: {
                        id:
                            req.body.account_id,

                        user_id:
                            req.user.id
                    },

                    transaction,

                    lock:
                        transaction.LOCK.UPDATE

                });


            if (!account) {

                throw new Error(
                    "Rekening tidak ditemukan."
                );

            }

                        const category =
                await Category.findOne({

                    where: {
                        id: req.body.category_id,
                        user_id: req.user.id,
                        type: "income"
                    },

                    transaction,

                    lock:
                        transaction.LOCK.UPDATE

                });


            if (!category) {

                throw new Error(
                    "Kategori pemasukan tidak ditemukan atau tidak sesuai."
                );

            }


            const income =
                await Transaction.create({

                    user_id:
                        req.user.id,

                    category_id:
                        req.body.category_id,

                    account_id:
                        req.body.account_id,

                    type:
                        "income",

                    amount:
                        req.body.amount,

                    description:
                        req.body.description,

                    transaction_date:
                        req.body.transaction_date

                }, {
                    transaction
                });


            account.balance =
                Number(account.balance) +
                Number(req.body.amount);


            await account.save({
                transaction
            });

await transaction.commit();

await createNotification({

    userId:
        req.user.id,

    type:
        "income",

    title:
        "Income ditambahkan",

    message:
        `Income ${formatCurrency(income.amount)} ditambahkan.`

});

res.status(201).json(
    income
);

        } catch (error) {

            await transaction.rollback();

            console.error(
                "POST /api/incomes:",
                error
            );

            res.status(400).json({
                success: false,
                message:
                    error.message
            });

        }

    }
);

// ============================================================
// FORMAT CURRENCY
// ============================================================

function formatCurrency(
    amount
) {

    return new Intl.NumberFormat(

        "id-ID",

        {

            style:
                "currency",

            currency:
                "IDR",

            maximumFractionDigits:
                0

        }

    ).format(

        Number(amount) || 0

    );

}

/*
|--------------------------------------------------------------------------
| EDIT INCOME
|--------------------------------------------------------------------------
*/

app.put(
    "/api/incomes/:id",
    auth,
    async (req, res) => {

        const transaction =
            await sequelize.transaction();

        try {

            const income =
                await Transaction.findOne({

                    where: {
                        id: req.params.id,
                        user_id: req.user.id,
                        type: "income"
                    },

                    transaction

                });

            if (!income) {

                await transaction.rollback();

                return res.status(404).json({
                    success: false,
                    message:
                        "Pemasukan tidak ditemukan."
                });

            }


            const {
                category_id,
                account_id,
                amount,
                description,
                transaction_date
            } = req.body;


            const category =
                await Category.findOne({

                    where: {
                        id: category_id,
                        user_id: req.user.id,
                        type: "income"
                    },

                    transaction

                });

            if (!category) {

                await transaction.rollback();

                return res.status(400).json({
                    success: false,
                    message:
                        "Kategori pemasukan tidak valid."
                });

            }


            const newAccount =
                await Account.findOne({

                    where: {
                        id: account_id,
                        user_id: req.user.id
                    },

                    transaction,

                    lock: transaction.LOCK.UPDATE

                });

            if (!newAccount) {

                await transaction.rollback();

                return res.status(400).json({
                    success: false,
                    message:
                        "Account tidak valid."
                });

            }


            const newAmount =
                Number(amount);

            if (
                !Number.isFinite(newAmount) ||
                newAmount <= 0
            ) {

                await transaction.rollback();

                return res.status(400).json({
                    success: false,
                    message:
                        "Jumlah pemasukan tidak valid."
                });

            }


            /*
            |--------------------------------------------------------------------------
            | LOCK OLD ACCOUNT
            |--------------------------------------------------------------------------
            */

            const oldAccount =
                await Account.findOne({

                    where: {
                        id: income.account_id,
                        user_id: req.user.id
                    },

                    transaction,

                    lock: transaction.LOCK.UPDATE

                });

            if (!oldAccount) {

                await transaction.rollback();

                return res.status(400).json({
                    success: false,
                    message:
                        "Account lama tidak ditemukan."
                });

            }


            const oldAmount =
                Number(income.amount);


            /*
            |--------------------------------------------------------------------------
            | UPDATE ACCOUNT BALANCE
            |--------------------------------------------------------------------------
            */

            if (
                oldAccount.id ===
                newAccount.id
            ) {

                const difference =
                    newAmount -
                    oldAmount;

                const currentBalance =
                    Number(
                        oldAccount.balance
                    );

                if (
                    currentBalance +
                    difference <
                    0
                ) {

                    await transaction.rollback();

                    return res.status(400).json({
                        success: false,
                        message:
                            "Saldo account tidak mencukupi."
                    });

                }

                oldAccount.balance =
                    currentBalance +
                    difference;

                await oldAccount.save({
                    transaction
                });

            } else {

                /*
                | Income lama dibatalkan
                */

                oldAccount.balance =
                    Number(oldAccount.balance) -
                    oldAmount;

                /*
                | Income baru diterapkan
                */

                newAccount.balance =
                    Number(newAccount.balance) +
                    newAmount;


                if (
                    Number(oldAccount.balance) < 0
                ) {

                    await transaction.rollback();

                    return res.status(400).json({
                        success: false,
                        message:
                            "Saldo account lama tidak mencukupi."
                    });

                }


                await oldAccount.save({
                    transaction
                });

                await newAccount.save({
                    transaction
                });

            }


            /*
            |--------------------------------------------------------------------------
            | UPDATE TRANSACTION
            |--------------------------------------------------------------------------
            */

            await income.update({

                category_id,
                account_id,
                amount: newAmount,
                description:
                    description ?? null,
                transaction_date

            }, {
                transaction
            });


            await transaction.commit();

await createNotification({

    userId:
        req.user.id,

    type:
        "expense",

    title:
        "Expense dicatat",

    message:
        `Expense ${formatCurrency(expense.amount)} dicatat.`

});

res.status(201).json(
    expense
);


            return res.json({

                success: true,

                message:
                    "Pemasukan berhasil diperbarui.",

                data: income

            });


        } catch (error) {

            await transaction.rollback();

            console.error(
                "PUT /api/incomes/:id:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Gagal memperbarui pemasukan."
            });

        }

    }
);

/*
|--------------------------------------------------------------------------
| DELETE INCOME
|--------------------------------------------------------------------------
*/

app.delete(
    "/api/incomes/:id",
    auth,
    async (req, res) => {

        const transaction =
            await sequelize.transaction();


        try {

            const income =
                await Transaction.findOne({

                    where: {
                        id:
                            req.params.id,

                        user_id:
                            req.user.id,

                        type:
                            "income"
                    },

                    transaction,

                    lock:
                        transaction.LOCK.UPDATE

                });


            if (!income) {

                throw new Error(
                    "Pemasukan tidak ditemukan."
                );

            }


            const account =
                await Account.findOne({

                    where: {
                        id:
                            income.account_id,

                        user_id:
                            req.user.id
                    },

                    transaction,

                    lock:
                        transaction.LOCK.UPDATE

                });


            if (!account) {

                throw new Error(
                    "Rekening pemasukan tidak ditemukan."
                );

            }


            account.balance =
                Number(account.balance) -
                Number(income.amount);


            await account.save({
                transaction
            });


            await income.destroy({
                transaction
            });


            await transaction.commit();


            res.json({
                success: true,
                message:
                    "Pemasukan berhasil dihapus."
            });

        } catch (error) {

            await transaction.rollback();

            console.error(
                "DELETE /api/incomes/:id:",
                error
            );

            res.status(400).json({
                success: false,
                message:
                    error.message
            });

        }

    }
);

/*
|--------------------------------------------------------------------------
| EXPENSE LIST
|--------------------------------------------------------------------------
*/

app.get(
    "/api/expenses",
    auth,
    async (req, res) => {

        try {

            const where = {
                user_id: req.user.id,
                type: "expense"
            };


            if (req.query.month) {

                const range =
                    getMonthRange(
                        req.query.month
                    );

                where.transaction_date = {
                    [Op.between]: [
                        range.start,
                        range.end
                    ]
                };

            }


            const expenses =
                await Transaction.findAll({

                    where,

                    include: [
                        {
                            model: Category,
                            as: "category"
                        },
                        {
                            model: Account,
                            as: "account",
                            required: false,
                            where: {
                                user_id: req.user.id
                            }
                        }
                    ],

                    order: [
                        ["transaction_date", "DESC"],
                        ["id", "DESC"]
                    ]

                });


            res.json(expenses);

        } catch (error) {

            console.error(
                "GET /api/expenses:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Gagal mengambil data pengeluaran."
            });

        }

    }
);



/*
|--------------------------------------------------------------------------
| ADD EXPENSE
|--------------------------------------------------------------------------
*/
app.post(
    "/api/expenses",
    auth,
    async (req, res) => {

        const errors =
            validateTransactionInput(
                req,
                "expense"
            );

        if (errors.length > 0) {

            return res.status(400).json({
                success: false,
                message:
                    "Data pengeluaran tidak valid.",
                errors
            });

        }


        const transaction =
            await sequelize.transaction();


        try {

            /*
            |--------------------------------------------------------------------------
            | VALIDATE CATEGORY
            |--------------------------------------------------------------------------
            */

            const category =
                await Category.findOne({

                    where: {
                        id:
                            req.body.category_id,

                        user_id:
                            req.user.id,

                        type:
                            "expense"
                    },

                    transaction,

                    lock:
                        transaction.LOCK.UPDATE

                });


            if (!category) {

                throw new Error(
                    "Kategori pengeluaran tidak ditemukan atau bukan kategori expense."
                );

            }


            /*
            |--------------------------------------------------------------------------
            | VALIDATE ACCOUNT
            |--------------------------------------------------------------------------
            */

            const account =
                await Account.findOne({

                    where: {
                        id:
                            req.body.account_id,

                        user_id:
                            req.user.id
                    },

                    transaction,

                    lock:
                        transaction.LOCK.UPDATE

                });


            if (!account) {

                throw new Error(
                    "Rekening tidak ditemukan."
                );

            }


            /*
            |--------------------------------------------------------------------------
            | CHECK BALANCE
            |--------------------------------------------------------------------------
            */

            if (
                Number(account.balance) <
                Number(req.body.amount)
            ) {

                throw new Error(
                    "Saldo rekening tidak mencukupi."
                );

            }


            /*
            |--------------------------------------------------------------------------
            | CREATE EXPENSE
            |--------------------------------------------------------------------------
            */

            const expense =
                await Transaction.create({

                    user_id:
                        req.user.id,

                    category_id:
                        req.body.category_id,

                    account_id:
                        req.body.account_id,

                    type:
                        "expense",

                    amount:
                        req.body.amount,

                    description:
                        req.body.description,

                    transaction_date:
                        req.body.transaction_date

                }, {
                    transaction
                });


            /*
            |--------------------------------------------------------------------------
            | UPDATE ACCOUNT BALANCE
            |--------------------------------------------------------------------------
            */

            account.balance =
                Number(account.balance) -
                Number(req.body.amount);


            await account.save({
                transaction
            });


/*
|--------------------------------------------------------------------------
| COMMIT
|--------------------------------------------------------------------------
*/

await transaction.commit();


// ========================================
// NOTIFICATION
// ========================================

await createNotification({

    userId:
        req.user.id,

    type:
        "expense",

    title:
        "Expense dicatat",

    message:
        `Expense ${formatCurrency(expense.amount)} dicatat.`

});


res.status(201).json(
    expense
);


        } catch (error) {

            await transaction.rollback();


            res.status(400).json({
                success: false,

                message:
                    error.message
            });

        }

    }
);

/*
|--------------------------------------------------------------------------
| EDIT EXPENSE
|--------------------------------------------------------------------------
*/

app.put(
    "/api/expenses/:id",
    auth,
    async (req, res) => {

        const transaction =
            await sequelize.transaction();

        try {

            const expense =
                await Transaction.findOne({

                    where: {
                        id: req.params.id,
                        user_id: req.user.id,
                        type: "expense"
                    },

                    transaction

                });

            if (!expense) {

                await transaction.rollback();

                return res.status(404).json({
                    success: false,
                    message:
                        "Pengeluaran tidak ditemukan."
                });

            }


            const {
                category_id,
                account_id,
                amount,
                description,
                transaction_date
            } = req.body;


            const category =
                await Category.findOne({

                    where: {
                        id: category_id,
                        user_id: req.user.id,
                        type: "expense"
                    },

                    transaction

                });

            if (!category) {

                await transaction.rollback();

                return res.status(400).json({
                    success: false,
                    message:
                        "Kategori pengeluaran tidak valid."
                });

            }


            const newAccount =
                await Account.findOne({

                    where: {
                        id: account_id,
                        user_id: req.user.id
                    },

                    transaction,

                    lock: transaction.LOCK.UPDATE

                });

            if (!newAccount) {

                await transaction.rollback();

                return res.status(400).json({
                    success: false,
                    message:
                        "Account tidak valid."
                });

            }


            const newAmount =
                Number(amount);

            if (
                !Number.isFinite(newAmount) ||
                newAmount <= 0
            ) {

                await transaction.rollback();

                return res.status(400).json({
                    success: false,
                    message:
                        "Jumlah pengeluaran tidak valid."
                });

            }


            /*
            |--------------------------------------------------------------------------
            | LOCK OLD ACCOUNT
            |--------------------------------------------------------------------------
            */

            const oldAccount =
                await Account.findOne({

                    where: {
                        id: expense.account_id,
                        user_id: req.user.id
                    },

                    transaction,

                    lock: transaction.LOCK.UPDATE

                });

            if (!oldAccount) {

                await transaction.rollback();

                return res.status(400).json({
                    success: false,
                    message:
                        "Account lama tidak ditemukan."
                });

            }


            const oldAmount =
                Number(expense.amount);


            /*
            |--------------------------------------------------------------------------
            | UPDATE ACCOUNT BALANCE
            |--------------------------------------------------------------------------
            */

            if (
                oldAccount.id ===
                newAccount.id
            ) {

                /*
                | Expense lama dibatalkan
                | Expense baru diterapkan
                |
                | saldo = saldo + old - new
                */

                const difference =
                    oldAmount -
                    newAmount;

                const currentBalance =
                    Number(
                        oldAccount.balance
                    );


                if (
                    currentBalance +
                    difference <
                    0
                ) {

                    await transaction.rollback();

                    return res.status(400).json({
                        success: false,
                        message:
                            "Saldo account tidak mencukupi."
                    });

                }


                oldAccount.balance =
                    currentBalance +
                    difference;


                await oldAccount.save({
                    transaction
                });

            } else {

                /*
                | Kembalikan expense lama
                */

                oldAccount.balance =
                    Number(oldAccount.balance) +
                    oldAmount;


                /*
                | Terapkan expense baru
                */

                const newBalance =
                    Number(newAccount.balance) -
                    newAmount;


                if (
                    newBalance < 0
                ) {

                    await transaction.rollback();

                    return res.status(400).json({
                        success: false,
                        message:
                            "Saldo account baru tidak mencukupi."
                    });

                }


                newAccount.balance =
                    newBalance;


                await oldAccount.save({
                    transaction
                });

                await newAccount.save({
                    transaction
                });

            }


            /*
            |--------------------------------------------------------------------------
            | UPDATE TRANSACTION
            |--------------------------------------------------------------------------
            */

            await expense.update({

                category_id,
                account_id,
                amount: newAmount,
                description:
                    description ?? null,
                transaction_date

            }, {
                transaction
            });


            await transaction.commit();


            return res.json({

                success: true,

                message:
                    "Pengeluaran berhasil diperbarui.",

                data: expense

            });


        } catch (error) {

            await transaction.rollback();

            console.error(
                "PUT /api/expenses/:id:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Gagal memperbarui pengeluaran."
            });

        }

    }
);

/*
|--------------------------------------------------------------------------
| DELETE EXPENSE
|--------------------------------------------------------------------------
*/

app.delete(
    "/api/expenses/:id",
    auth,
    async (req, res) => {

        const transaction =
            await sequelize.transaction();


        try {

            const expense =
                await Transaction.findOne({

                    where: {
                        id:
                            req.params.id,

                        user_id:
                            req.user.id,

                        type:
                            "expense"
                    },

                    transaction,

                    lock:
                        transaction.LOCK.UPDATE

                });


            if (!expense) {

                throw new Error(
                    "Pengeluaran tidak ditemukan."
                );

            }


            const account =
                await Account.findOne({

                    where: {
                        id:
                            expense.account_id,

                        user_id:
                            req.user.id
                    },

                    transaction,

                    lock:
                        transaction.LOCK.UPDATE

                });


            if (!account) {

                throw new Error(
                    "Rekening transaksi tidak ditemukan."
                );

            }


            account.balance =
                Number(account.balance) +
                Number(expense.amount);


            await account.save({
                transaction
            });


            await expense.destroy({
                transaction
            });


            await transaction.commit();


            res.json({
                success: true
            });

        } catch (error) {

            await transaction.rollback();

            console.error(
                "DELETE /api/expenses/:id:",
                error
            );

            res.status(400).json({
                success: false,
                message:
                    error.message
            });

        }

    }
);


/*
|--------------------------------------------------------------------------
| BUDGET
|--------------------------------------------------------------------------
*/

app.get(
    "/api/budgets",
    auth,
    async (req, res) => {

        try {

            const requestedMonth =
                req.query.month ||
                new Date()
                    .toISOString()
                    .slice(0, 7);


            /*
            |--------------------------------------------------------------------------
            | VALIDATE MONTH
            |--------------------------------------------------------------------------
            */

            if (
                typeof requestedMonth !== "string" ||
                !/^\d{4}-(0[1-9]|1[0-2])$/.test(
                    requestedMonth
                )
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Bulan budget harus menggunakan format YYYY-MM."
                });

            }


            const [
                year,
                month
            ] =
                requestedMonth
                    .split("-")
                    .map(Number);


            /*
            |--------------------------------------------------------------------------
            | GET BUDGET
            |--------------------------------------------------------------------------
            */

            const budgets =
                await MonthlyBudget.findAll({

                    where: {
                        user_id:
                            req.user.id,

                        month,

                        year
                    },

                    include: [
                        {
                            model: Category,
                            as: "category"
                        }
                    ]

                });


            res.json(budgets);

        } catch (error) {

            console.error(
                "GET /api/budgets:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Gagal mengambil data budget."
            });

        }

    }
);



app.post(
    "/api/budgets",
    auth,
    async (req, res) => {

        try {

            const {
                category_id,
                month,
                amount
            } = req.body;


            /*
            |--------------------------------------------------------------------------
            | VALIDATE MONTH
            |--------------------------------------------------------------------------
            */

            if (
                !month ||
                !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Bulan budget harus menggunakan format YYYY-MM."
                });

            }


            /*
            |--------------------------------------------------------------------------
            | PARSE MONTH & YEAR
            |--------------------------------------------------------------------------
            */

            const [
                year,
                monthNumber
            ] =
                month
                    .split("-")
                    .map(Number);


            /*
            |--------------------------------------------------------------------------
            | VALIDATE AMOUNT
            |--------------------------------------------------------------------------
            */

            if (
                amount === undefined ||
                amount === null ||
                Number(amount) <= 0 ||
                !Number.isFinite(Number(amount))
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Jumlah budget harus lebih besar dari 0."
                });

            }


            /*
            |--------------------------------------------------------------------------
            | VALIDATE CATEGORY
            |--------------------------------------------------------------------------
            */

            const category =
                await Category.findOne({

                    where: {
                        id:
                            category_id,

                        user_id:
                            req.user.id,

                        type:
                            "expense"
                    }

                });


            if (!category) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Kategori budget tidak ditemukan atau bukan kategori expense."
                });

            }


            /*
            |--------------------------------------------------------------------------
            | CHECK EXISTING BUDGET
            |--------------------------------------------------------------------------
            */

            const existing =
                await MonthlyBudget.findOne({

                    where: {
                        user_id:
                            req.user.id,

                        category_id,

                        month:
                            monthNumber,

                        year
                    }

                });


            let budget;


            /*
            |--------------------------------------------------------------------------
            | UPDATE EXISTING
            |--------------------------------------------------------------------------
            */

            if (existing) {

                budget =
                    await existing.update({

                        amount:
                            Number(amount)

                    });


            /*
            |--------------------------------------------------------------------------
            | CREATE NEW
            |--------------------------------------------------------------------------
            */

            } else {

                budget =
                    await MonthlyBudget.create({

                        user_id:
                            req.user.id,

                        category_id,

                        month:
                            monthNumber,

                        year,

                        amount:
                            Number(amount)

                    }
                );
                await createNotification({

    userId:
        req.user.id,

    type:
        "budget",

    title:
        "Budget dibuat",

    message:
        `Budget baru sebesar ${formatCurrency(amount)} berhasil dibuat.`

});

            }


            /*
            |--------------------------------------------------------------------------
            | RESPONSE
            |--------------------------------------------------------------------------
            */

            res.status(
                existing ? 200 : 201
            ).json(
                budget
            );


        } catch (error) {

            console.error(
                "POST /api/budgets:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Gagal menyimpan budget."
            });

        }

    }
);



/*
|--------------------------------------------------------------------------
| DASHBOARD
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| DASHBOARD
|--------------------------------------------------------------------------
*/

app.get(
    "/api/dashboard",
    auth,
    async (req, res) => {

        try {

            const month =
                req.query.month ||
                new Date()
                    .toISOString()
                    .slice(0, 7);


            /*
            |--------------------------------------------------------------------------
            | VALIDATE MONTH
            |--------------------------------------------------------------------------
            */

            if (
                typeof month !== "string" ||
                !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Bulan harus menggunakan format YYYY-MM."
                });

            }


            const [
                year,
                monthNumber
            ] =
                month
                    .split("-")
                    .map(Number);


            /*
            |--------------------------------------------------------------------------
            | GET DATA
            |--------------------------------------------------------------------------
            */

            const [
                incomes,
                expenses,
                budgets,
                accounts
            ] = await Promise.all([

                Transaction.findAll({

                    where: {
                        user_id: req.user.id,
                        type: "income",

                        transaction_date: {
                            [Op.between]: [
                                getMonthRange(month).start,
                                getMonthRange(month).end
                            ]
                        }
                    },

                    include: [
                        {
                            model: Category,
                            as: "category"
                        },

                        {
                            model: Account,
                            as: "account"
                        }
                    ]

                }),


                Transaction.findAll({

                    where: {
                        user_id: req.user.id,
                        type: "expense",

                        transaction_date: {
                            [Op.between]: [
                                getMonthRange(month).start,
                                getMonthRange(month).end
                            ]
                        }
                    },

                    include: [
                        {
                            model: Category,
                            as: "category"
                        },

                        {
                            model: Account,
                            as: "account"
                        }
                    ]

                }),


                MonthlyBudget.findAll({

                    where: {
                        user_id: req.user.id,
                        month: monthNumber,
                        year
                    },

                    include: [
                        {
                            model: Category,
                            as: "category"
                        }
                    ]

                }),


                Account.findAll({

                    where: {
                        user_id: req.user.id
                    },

                    order: [
                        ["name", "ASC"]
                    ]

                })

            ]);


            /*
            |--------------------------------------------------------------------------
            | TOTALS
            |--------------------------------------------------------------------------
            */

            const totalIncome =
                sumRows(incomes);


            const totalExpense =
                sumRows(expenses);


            const balance =
                sumRows(
                    accounts.map(
                        account => ({
                            amount:
                                account.balance
                        })
                    )
                );


            const saving =
                totalIncome -
                totalExpense;


            const expenseRate =
                totalIncome > 0
                    ? Math.round(
                        totalExpense /
                        totalIncome *
                        100
                    )
                    : 0;


            const savingRate =
                totalIncome > 0
                    ? Math.round(
                        saving /
                        totalIncome *
                        100
                    )
                    : 0;


            /*
            |--------------------------------------------------------------------------
            | CATEGORY EXPENSES
            |--------------------------------------------------------------------------
            */

            const categoryMap = {};


            expenses.forEach(
                expense => {

                    const name =
                        expense.category?.name ||
                        "Lainnya";


                    categoryMap[name] =
                        (categoryMap[name] || 0) +
                        Number(expense.amount);

                }
            );


            const categoryExpenses =
                Object.entries(
                    categoryMap
                ).map(
                    ([name, amount]) => ({
                        name,
                        amount
                    })
                );


            /*
            |--------------------------------------------------------------------------
            | BUDGET PROGRESS
            |--------------------------------------------------------------------------
            */

            const budgetProgress =
                budgets.map(
                    budget => {

                        const categoryName =
                            budget.category?.name ||
                            "Lainnya";


                        const spent =
                            categoryMap[
                                categoryName
                            ] || 0;


                        const limit =
                            Number(
                                budget.amount
                            );


                        const percentage =
                            limit > 0
                                ? Math.round(
                                    spent /
                                    limit *
                                    100
                                )
                                : 0;


                        return {

                            id:
                                budget.id,

                            category:
                                categoryName,

                            budget:
                                limit,

                            spent,

                            percentage

                        };

                    }
                );


            /*
            |--------------------------------------------------------------------------
            | RESPONSE
            |--------------------------------------------------------------------------
            */

            return res.json({

                success: true,

                month,

                totalIncome,

                totalExpense,

                balance,

                saving,

                expenseRate,

                savingRate,

                categoryExpenses,

                budgetProgress,

                accounts

            });

        } catch (error) {

            console.error(
                "GET /api/dashboard:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Gagal mengambil data dashboard."

            });

        }

    }
);


/*
|--------------------------------------------------------------------------
| START SERVER
|--------------------------------------------------------------------------
*/

async function startServer() {

    try {

        await sequelize.authenticate();

        console.log(
            "MySQL connected successfully."
        );


        app.listen(
            process.env.PORT || 3000,
            () => {

                console.log(
                    "API running at http://localhost:3000"
                );

            }
        );

    } catch (error) {

        console.error(
            "Database connection failed:"
        );

        console.error(
            error.message
        );

        process.exit(1);

    }

}


startServer();