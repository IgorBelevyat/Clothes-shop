// ОНОВЛЕНИЙ product.routes.js

const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller.js');
const verifyToken = require('../middlewares/verifyToken.middleware.js');
const upload = require('../middlewares/upload.middleware.js');

// ВАЖЛИВО: Специфічні маршрути ПЕРЕД параметризованими

// Завантаження зображень
router.post('/upload', verifyToken, upload.single('image'), productController.uploadImage);

// НОВИЙ РОУТ: Отримати всі доступні фільтри (без категорії)
router.get('/filters', productController.getAllFilters);

// Отримати фільтри для категорії (ПЕРЕД /:id маршрутами)
router.get('/filters/:categoryId', productController.getCategoryFilters);

// Отримати всі продукти з фільтрацією
router.get('/', productController.getAllProducts);

// Створити продукт з атрибутами
router.post('/', verifyToken, productController.createProduct);

// Оновити продукт (ПІСЛЯ специфічних маршрутів)
router.put('/:id', verifyToken, productController.updateProduct);

// Видалити продукт (ПІСЛЯ специфічних маршрутів)
router.delete('/:id', verifyToken, productController.deleteProduct);

module.exports = router;