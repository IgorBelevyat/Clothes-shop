const express = require('express');
const router = express.Router();


const authRoutes = require('./auth.routes.js');
const categoryRoutes = require('./category.routes.js');


router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);

// Пізніше додати інші маршрути


module.exports = router;