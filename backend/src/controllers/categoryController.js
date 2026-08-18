const db = require("../config/database");


// ========================================
// GET ALL CATEGORIES
// ========================================

async function getCategories(req, res) {

    try {

        const userId = req.user.id;

        const [rows] = await db.execute(
            `
            SELECT
                id,
                name,
                type,
                icon,
                color,
                created_at,
                updated_at
            FROM categories
            WHERE user_id = ?
            ORDER BY type ASC, name ASC
            `,
            [userId]
        );

        return res.json({
            success: true,
            data: rows
        });

    } catch (error) {

        console.error(
            "GET CATEGORIES ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Gagal mengambil kategori."
        });

    }

}


// ========================================
// CREATE CATEGORY
// ========================================

async function createCategory(req, res) {

    try {

        const userId = req.user.id;

        const {
            name,
            type,
            icon,
            color
        } = req.body;


        if (
            typeof name !== "string" ||
            !name.trim()
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Nama kategori wajib diisi."
            });

        }


        if (
            ![
                "income",
                "expense"
            ].includes(type)
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Tipe kategori tidak valid."
            });

        }


        const cleanName =
            name.trim();


        if (cleanName.length > 100) {

            return res.status(400).json({
                success: false,
                message:
                    "Nama kategori maksimal 100 karakter."
            });

        }


        const [existing] =
            await db.execute(
                `
                SELECT id
                FROM categories
                WHERE user_id = ?
                  AND name = ?
                  AND type = ?
                LIMIT 1
                `,
                [
                    userId,
                    cleanName,
                    type
                ]
            );


        if (existing.length > 0) {

            return res.status(409).json({
                success: false,
                message:
                    "Kategori dengan nama tersebut sudah ada."
            });

        }


        const [result] =
            await db.execute(
                `
                INSERT INTO categories
                (
                    user_id,
                    name,
                    type,
                    icon,
                    color
                )
                VALUES (?, ?, ?, ?, ?)
                `,
                [
                    userId,
                    cleanName,
                    type,
                    icon || null,
                    color || null
                ]
            );


        return res.status(201).json({

            success: true,

            message:
                "Kategori berhasil dibuat.",

            data: {
                id: result.insertId,
                name: cleanName,
                type,
                icon: icon || null,
                color: color || null
            }

        });

    } catch (error) {

        console.error(
            "CREATE CATEGORY ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Gagal membuat kategori."
        });

    }

}


// ========================================
// UPDATE CATEGORY
// ========================================

async function updateCategory(req, res) {

    try {

        const userId = req.user.id;

        const categoryId =
            Number(req.params.id);


        if (
            !Number.isInteger(categoryId) ||
            categoryId <= 0
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "ID kategori tidak valid."
            });

        }


        const {
            name,
            type,
            icon,
            color
        } = req.body;


        if (
            typeof name !== "string" ||
            !name.trim()
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Nama kategori wajib diisi."
            });

        }


        if (
            ![
                "income",
                "expense"
            ].includes(type)
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Tipe kategori tidak valid."
            });

        }


        const cleanName =
            name.trim();


        if (cleanName.length > 100) {

            return res.status(400).json({
                success: false,
                message:
                    "Nama kategori maksimal 100 karakter."
            });

        }


        const [categoryRows] =
            await db.execute(
                `
                SELECT
                    id,
                    name,
                    type,
                    icon,
                    color
                FROM categories
                WHERE id = ?
                  AND user_id = ?
                LIMIT 1
                `,
                [
                    categoryId,
                    userId
                ]
            );


        if (categoryRows.length === 0) {

            return res.status(404).json({
                success: false,
                message:
                    "Kategori tidak ditemukan."
            });

        }


        const [duplicateRows] =
            await db.execute(
                `
                SELECT id
                FROM categories
                WHERE user_id = ?
                  AND name = ?
                  AND type = ?
                  AND id <> ?
                LIMIT 1
                `,
                [
                    userId,
                    cleanName,
                    type,
                    categoryId
                ]
            );


        if (duplicateRows.length > 0) {

            return res.status(409).json({
                success: false,
                message:
                    "Kategori dengan nama tersebut sudah ada."
            });

        }


        /*
        |--------------------------------------------------------------------------
        | CEK PERUBAHAN TYPE
        |--------------------------------------------------------------------------
        |
        | Kalau kategori sudah dipakai transaksi,
        | jangan izinkan income <-> expense.
        |
        */

        const oldType =
            categoryRows[0].type;


        if (oldType !== type) {

            const [transactionRows] =
                await db.execute(
                    `
                    SELECT id
                    FROM transactions
                    WHERE category_id = ?
                      AND user_id = ?
                    LIMIT 1
                    `,
                    [
                        categoryId,
                        userId
                    ]
                );


            if (transactionRows.length > 0) {

                return res.status(409).json({
                    success: false,
                    message:
                        "Tipe kategori tidak dapat diubah karena kategori sudah digunakan pada transaksi."
                });

            }

        }


        await db.execute(
            `
            UPDATE categories
            SET
                name = ?,
                type = ?,
                icon = ?,
                color = ?
            WHERE id = ?
              AND user_id = ?
            `,
            [
                cleanName,
                type,
                icon || null,
                color || null,
                categoryId,
                userId
            ]
        );


        return res.json({

            success: true,

            message:
                "Kategori berhasil diperbarui.",

            data: {
                id: categoryId,
                name: cleanName,
                type,
                icon: icon || null,
                color: color || null
            }

        });

    } catch (error) {

        console.error(
            "UPDATE CATEGORY ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Gagal memperbarui kategori."
        });

    }

}


// ========================================
// DELETE CATEGORY
// ========================================

async function deleteCategory(req, res) {

    try {

        const userId = req.user.id;

        const categoryId =
            Number(req.params.id);


        if (
            !Number.isInteger(categoryId) ||
            categoryId <= 0
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "ID kategori tidak valid."
            });

        }


        /*
        |--------------------------------------------------------------------------
        | CHECK CATEGORY
        |--------------------------------------------------------------------------
        */

        const [categoryRows] =
            await db.execute(
                `
                SELECT
                    id,
                    name,
                    type
                FROM categories
                WHERE id = ?
                  AND user_id = ?
                LIMIT 1
                `,
                [
                    categoryId,
                    userId
                ]
            );


        if (categoryRows.length === 0) {

            return res.status(404).json({
                success: false,
                message:
                    "Kategori tidak ditemukan."
            });

        }


        /*
        |--------------------------------------------------------------------------
        | CHECK TRANSACTIONS
        |--------------------------------------------------------------------------
        */

        const [transactionRows] =
            await db.execute(
                `
                SELECT id
                FROM transactions
                WHERE category_id = ?
                  AND user_id = ?
                LIMIT 1
                `,
                [
                    categoryId,
                    userId
                ]
            );


        if (transactionRows.length > 0) {

            return res.status(409).json({
                success: false,
                message:
                    "Kategori tidak dapat dihapus karena sudah digunakan pada transaksi."
            });

        }


        /*
        |--------------------------------------------------------------------------
        | DELETE
        |--------------------------------------------------------------------------
        */

        await db.execute(
            `
            DELETE FROM categories
            WHERE id = ?
              AND user_id = ?
            `,
            [
                categoryId,
                userId
            ]
        );


        return res.json({

            success: true,

            message:
                "Kategori berhasil dihapus."

        });

    } catch (error) {

        console.error(
            "DELETE CATEGORY ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Gagal menghapus kategori."
        });

    }

}


// ========================================
// EXPORT
// ========================================

module.exports = {

    getCategories,

    createCategory,

    updateCategory,

    deleteCategory

};