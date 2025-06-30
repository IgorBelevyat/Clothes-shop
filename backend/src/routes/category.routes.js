//category.routes.js

const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller.js');
const verifyToken = require('../middlewares/verifyToken.middleware.js'); 

// Отримати всі категорії з атрибутами
router.get('/', categoryController.getAllCategories);

// Створити категорію
router.post('/', verifyToken, categoryController.createCategory);

// Оновити категорію
router.put('/:id', verifyToken, categoryController.updateCategory);

// Отримати товари за категорією
router.get('/:id/products', categoryController.getProductsByCategoryId); 

// Отримати атрибути категорії (включаючи успадковані)
router.get('/:id/attributes', categoryController.getCategoryAttributesWithInherited);

// Видалити категорію
router.delete('/:id', verifyToken, categoryController.deleteCategory);

module.exports = router;