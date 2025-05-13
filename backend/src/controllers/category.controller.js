const prisma = require('../config/prisma.client.js');

// Вивести в сервіси 
async function getCategoryTreeLocal() {
  const allCategories = await prisma.category.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  const categoryMap = new Map();
  allCategories.forEach(category => {
    category.children = []; 
    categoryMap.set(category.id, category);
  });

  const rootCategories = [];
  allCategories.forEach(category => {
    if (category.parentId === null) {
      rootCategories.push(category);
    } else {
      const parent = categoryMap.get(category.parentId);
      if (parent) {
        parent.children.push(category);
      }
    }
  });
  return rootCategories;
}

async function isDescendantOfLocal(potentialDescendantId, ancestorId) {
  let category = await prisma.category.findUnique({
    where: { id: potentialDescendantId },
  });

  while (category) {
    if (category.parentId === null) {
      return false; 
    }
    if (category.parentId === ancestorId) {
      return true; 
    }
    category = await prisma.category.findUnique({
      where: { id: category.parentId },
    });
  }
  return false; 
}

//--------

const getAllCategories = async (req, res, next) => {
  try {
    const categoryTree = await getCategoryTreeLocal();
    res.status(200).json(categoryTree);
  } catch (err) {
    next(err);
  }
};

const createCategory = async (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'content-manager') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { name, parentId } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Category name is required' });
  }

  try {
    if (parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: parseInt(parentId) },
      });
      if (!parentCategory) {
        return res.status(404).json({ error: 'Parent category not found' });
      }
    }

    const newCategory = await prisma.category.create({
      data: {
        name: name.trim(),
        parentId: parentId ? parseInt(parentId) : null,
      },
    });
    res.status(201).json(newCategory);
  } catch (err) {
    next(err);
  }
};

const updateCategory = async (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'content-manager') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const categoryId = parseInt(req.params.id);
  if (isNaN(categoryId)) {
    return res.status(400).json({ error: 'Invalid category ID' });
  }

  const { name, parentId } = req.body; 

  try {
    const categoryToUpdate = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!categoryToUpdate) {
      return res.status(404).json({ error: 'Category not found' });
    }

    let newParentId = parentId !== undefined ? (parentId ? parseInt(parentId) : null) : categoryToUpdate.parentId;

    if (newParentId === categoryId) {
      return res.status(400).json({ error: 'Category cannot be its own parent' });
    }

    if (newParentId !== null) { 
      const isDescendant = await isDescendantOfLocal(newParentId, categoryId);
      if (isDescendant) {
        return res.status(400).json({ error: 'Cannot move category into its own subcategory (cyclic dependency)' });
      }
    }
    
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: name !== undefined ? name.trim() : categoryToUpdate.name,
        parentId: newParentId,
      },
    });
    res.status(200).json(updatedCategory);
  } catch (err) {
    next(err);
  }
};

const getProductsByCategoryId = async (req, res, next) => {
  const categoryId = parseInt(req.params.id);
  if (isNaN(categoryId)) {
    return res.status(400).json({ error: 'Invalid category ID' });
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const products = await prisma.product.findMany({
      where: { categoryId: categoryId },
    });
    res.status(200).json(products);
  } catch (err) {
    next(err);
  }
};

const deleteCategory = async (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'content-manager') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const categoryId = parseInt(req.params.id);
  if (isNaN(categoryId)) {
    return res.status(400).json({ error: 'Invalid category ID' });
  }

  try {
    const categoryToDelete = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!categoryToDelete) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const subcategories = await prisma.category.findMany({
      where: { parentId: categoryId },
    });
    if (subcategories.length > 0) {
      return res.status(400).json({ error: 'Cannot delete category with subcategories. Delete subcategories first.' });
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });
    res.status(200).json({ message: 'Category successfully deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  getProductsByCategoryId,
  deleteCategory,
};