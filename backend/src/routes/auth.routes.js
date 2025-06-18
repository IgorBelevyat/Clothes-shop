const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller.js');
const verifyToken = require('../middlewares/verifyToken.middleware.js');

router.post('/register', authController.register);
router.post('/login', authController.login);

router.get('/me', verifyToken, authController.getMe);

router.post('/logout', authController.logout);

module.exports = router;