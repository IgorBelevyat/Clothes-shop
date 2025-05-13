const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller.js');
const verifyToken = require('../middlewares/verifyToken.middleware.js'); 

router.get('/', categoryController.getAllCategories);

router.post('/', verifyToken, categoryController.createCategory);
router.put('/:id', verifyToken, categoryController.updateCategory);
router.get('/:id/products', verifyToken, categoryController.getProductsByCategoryId); 
router.delete('/:id', verifyToken, categoryController.deleteCategory);

module.exports = router;