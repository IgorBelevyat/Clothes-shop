// ОНОВИТИ ІСНУЮЧИЙ ФАЙЛ: routes/attribute.routes.js

const express = require('express');
const router = express.Router();
const attributeController = require('../controllers/attribute.controller.js');
const verifyToken = require('../middlewares/verifyToken.middleware.js');

// Отримати всі атрибути
router.get('/', attributeController.getAllAttributes);

// ВАЖЛИВО: Специфічні маршрути ПЕРЕД параметризованими
// Змінити порядок атрибутів
router.put('/reorder', verifyToken, attributeController.reorderAttributes);

// Змінити порядок значень атрибутів
router.put('/values/reorder', verifyToken, attributeController.reorderAttributeValues);

// Створити новий атрибут
router.post('/', verifyToken, attributeController.createAttribute);

// Прив'язати атрибут до категорії
router.post('/assign', verifyToken, attributeController.assignAttributeToCategory);

// Відв'язати атрибут від категорії
router.delete('/unassign', verifyToken, attributeController.unassignAttributeFromCategory);

// НОВІ МАРШРУТИ ДЛЯ ЗАЛЕЖНОСТЕЙ
// Отримати значення залежного атрибуту
router.get('/dependent/:attributeSlug/parent/:parentValueId', attributeController.getDependentAttributeValues);

// Отримати атрибути категорії з інформацією про залежності
router.get('/category/:categoryId/with-dependencies', attributeController.getCategoryAttributesWithDependencies);

// Отримати атрибути для категорії (включаючи батьківські)
router.get('/category/:categoryId/with-parents', attributeController.getCategoryAttributesWithParents);

// Отримати атрибути для категорії
router.get('/category/:categoryId', attributeController.getCategoryAttributes);

// Додати значення до атрибуту
router.post('/:attributeId/values', verifyToken, attributeController.addAttributeValue);

// Оновити значення атрибуту
router.put('/values/:valueId', verifyToken, attributeController.updateAttributeValue);

// Видалити значення атрибуту
router.delete('/values/:valueId', verifyToken, attributeController.deleteAttributeValue);

// Оновити атрибут (ПІСЛЯ специфічних маршрутів)
router.put('/:id', verifyToken, attributeController.updateAttribute);

// Видалити атрибут (ПІСЛЯ специфічних маршрутів)
router.delete('/:id', verifyToken, attributeController.deleteAttribute);

module.exports = router;