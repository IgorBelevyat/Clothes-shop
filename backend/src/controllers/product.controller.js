const prisma = require('../config/prisma.client.js');

const getAllProducts = async (req, res, next) => {
  const { title, description, price, category } = req.query;

  try {
    const filters = {};

    if (title) {
      filters.title = {
        contains: title,
        mode: 'insensitive',
      };
    }
    if (description) {
      filters.description = {
        contains: description,
        mode: 'insensitive',
      };
    }
    if (price) {
      filters.price = {
        lte: parseFloat(price),
      };
    }
    if (category) {
      filters.categoryId = parseInt(category);
    }

    const products = await prisma.product.findMany({
      where: filters,
      include: {
        category: true,
      },
    });

    res.json(products);
  } catch (err) {
    next(err);
  }
};

const createProduct = async (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'content-manager') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { title, description, price, image, categoryId } = req.body;

  if (!title || !description || price === undefined || !image || categoryId === undefined) {
    return res.status(400).json({ error: 'All fields (title, description, price, image, categoryId) are required' });
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id: parseInt(categoryId) },
    });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const newProduct = await prisma.product.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        image,
        categoryId: parseInt(categoryId),
      },
    });
    res.status(201).json(newProduct);
  } catch (err) {
    next(err);
  }
};

const uploadImage = async (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'content-manager') {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }
    res.status(200).json({ url: req.file.path });
  } catch (err) {
    next(err);
  }
};

const updateProduct = async (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'content-manager') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const productId = parseInt(req.params.id);
  if (isNaN(productId)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  const { title, description, price, image, categoryId } = req.body;

  try {
    const productToUpdate = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!productToUpdate) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const dataToUpdate = {};
    if (title !== undefined) dataToUpdate.title = title;
    if (description !== undefined) dataToUpdate.description = description;
    if (price !== undefined) dataToUpdate.price = parseFloat(price);
    if (image !== undefined) dataToUpdate.image = image;
    if (categoryId !== undefined) {
      const newCategoryId = parseInt(categoryId);
      const category = await prisma.category.findUnique({ where: { id: newCategoryId } });
      if (!category) {
        return res.status(404).json({ error: 'New category not found' });
      }
      dataToUpdate.categoryId = newCategoryId;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return res.status(400).json({ error: 'No fields to update provided' });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: dataToUpdate,
    });
    res.status(200).json(updatedProduct);
  } catch (err) {
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'content-manager') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const productId = parseInt(req.params.id);
  if (isNaN(productId)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  try {
    const productToDelete = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!productToDelete) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await prisma.product.delete({
      where: { id: productId },
    });
    res.status(200).json({ message: 'Product successfully deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  uploadImage,
  updateProduct,
  deleteProduct,
};