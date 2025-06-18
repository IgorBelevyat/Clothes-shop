const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/banner.controller.js');
const verifyToken = require('../middlewares/verifyToken.middleware.js');
const upload = require('../middlewares/upload.middleware.js');


router.get('/', bannerController.getActiveBannerSlides);

router.get('/cms', verifyToken, bannerController.getAllBannerSlides);
router.post('/cms', verifyToken, upload.single('image'), bannerController.createBannerSlide);
router.put('/cms/:id', verifyToken, upload.single('image'), bannerController.updateBannerSlide);
router.delete('/cms/:id', verifyToken, bannerController.deleteBannerSlide);
router.post('/cms/reorder', verifyToken, bannerController.reorderBannerSlides);

module.exports = router;