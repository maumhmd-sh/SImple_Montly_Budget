const express = require("express");

const {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
} = require("../controllers/categoryController");

const authMiddleware =
    require("../middleware/authMiddleware");

const router = express.Router();


// GET /api/categories
router.get(
    "/",
    authMiddleware,
    getCategories
);


// POST /api/categories
router.post(
    "/",
    authMiddleware,
    createCategory
);


// PUT /api/categories/:id
router.put(
    "/:id",
    authMiddleware,
    updateCategory
);


// DELETE /api/categories/:id
router.delete(
    "/:id",
    authMiddleware,
    deleteCategory
);


module.exports = router;