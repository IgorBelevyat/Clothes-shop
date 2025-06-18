const prisma = require('../config/prisma.client.js');

const getActiveBannerSlides = async (req, res, next) => {
  try {
    const slides = await prisma.bannerSlide.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' }
    });
    res.json(slides);
  } catch (err) {
    next(err);
  }
};

const getAllBannerSlides = async (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'content-manager') {
    return res.status(403).json({ error: 'Access denied' });
  }
  try {
    const slides = await prisma.bannerSlide.findMany({
      orderBy: { displayOrder: 'asc' }
    });
    res.json(slides);
  } catch (err) {
    next(err);
  }
};

const createBannerSlide = async (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'content-manager') {
    return res.status(403).json({ error: 'Access denied' });
  }
  try {
    const { title, subtitle, linkUrl, linkText, isActive } = req.body;
    const imageUrl = req.file ? req.file.path : null;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const highestOrder = await prisma.bannerSlide.findFirst({
      orderBy: { displayOrder: 'desc' },
      select: { displayOrder: true }
    });
    const displayOrder = highestOrder ? highestOrder.displayOrder + 1 : 0;

    const newSlide = await prisma.bannerSlide.create({
      data: {
        title: title || null,
        subtitle: subtitle || null,
        imageUrl,
        linkUrl: linkUrl || null,
        linkText: linkText || null,
        isActive: isActive === 'true' || isActive === true,
        displayOrder
      }
    });

    res.status(201).json(newSlide);
  } catch (err) {
    next(err);
  }
};

const updateBannerSlide = async (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'content-manager') {
    return res.status(403).json({ error: 'Access denied' });
  }
  const slideId = parseInt(req.params.id);
  if (isNaN(slideId)) {
    return res.status(400).json({ error: 'Invalid slide ID' });
  }
  try {
    const slide = await prisma.bannerSlide.findUnique({
      where: { id: slideId }
    });
    if (!slide) {
      return res.status(404).json({ error: 'Slide not found' });
    }

    const { title, subtitle, linkUrl, linkText, isActive, displayOrder } = req.body;
    const imageUrl = req.file ? req.file.path : undefined;

    const updatedSlide = await prisma.bannerSlide.update({
      where: { id: slideId },
      data: {
        title: title === undefined ? slide.title : title || null,
        subtitle: subtitle === undefined ? slide.subtitle : subtitle || null,
        imageUrl: imageUrl || slide.imageUrl,
        linkUrl: linkUrl === undefined ? slide.linkUrl : linkUrl || null,
        linkText: linkText === undefined ? slide.linkText : linkText || null,
        isActive: isActive === undefined ? slide.isActive : isActive === 'true' || isActive === true,
        displayOrder: displayOrder === undefined ? slide.displayOrder : parseInt(displayOrder)
      }
    });

    res.json(updatedSlide);
  } catch (err) {
    next(err);
  }
};

const deleteBannerSlide = async (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'content-manager') {
    return res.status(403).json({ error: 'Access denied' });
  }
  const slideId = parseInt(req.params.id);
  if (isNaN(slideId)) {
    return res.status(400).json({ error: 'Invalid slide ID' });
  }
  try {
    const slide = await prisma.bannerSlide.findUnique({
      where: { id: slideId }
    });
    if (!slide) {
      return res.status(404).json({ error: 'Slide not found' });
    }
    await prisma.bannerSlide.delete({ where: { id: slideId } });
    res.json({ message: 'Banner slide successfully deleted' });
  } catch (err) {
    next(err);
  }
};

const reorderBannerSlides = async (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'content-manager') {
    return res.status(403).json({ error: 'Access denied' });
  }
  const { slideIds } = req.body;
  if (!Array.isArray(slideIds)) {
    return res.status(400).json({ error: 'Invalid slideIds array' });
  }
  try {
    const updates = slideIds.map((id, index) => {
      return prisma.bannerSlide.update({
        where: { id: parseInt(id) },
        data: { displayOrder: index }
      });
    });
    await Promise.all(updates);
    res.json({ message: 'Banner slides successfully reordered' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getActiveBannerSlides,
  getAllBannerSlides,
  createBannerSlide,
  updateBannerSlide,
  deleteBannerSlide,
  reorderBannerSlides,
};