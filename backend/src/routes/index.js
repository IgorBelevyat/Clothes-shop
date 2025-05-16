const express = require('express');
const router = express.Router();


const authRoutes = require('./auth.routes.js');
const categoryRoutes = require('./category.routes.js');
const productRoutes = require('./product.routes.js');
const bannerRoutes = require('./banner.routes.js');
const userRoutes = require('./user.routes'); 


router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/banner', bannerRoutes);
router.use('/users', userRoutes);

module.exports = router;