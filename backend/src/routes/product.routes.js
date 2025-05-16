const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller.js');
const verifyToken = require('../middlewares/verifyToken.middleware.js');
const upload = require('../middlewares/upload.middleware.js');


router.post('/upload', verifyToken, upload.single('image'), productController.uploadImage);
router.post('/', verifyToken, productController.createProduct);
router.get('/', productController.getAllProducts);
router.put('/:id', verifyToken, productController.updateProduct);
router.delete('/:id', verifyToken, productController.deleteProduct);

module.exports = router;