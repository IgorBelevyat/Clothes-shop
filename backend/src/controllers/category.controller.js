const prisma = require('../config/prisma.client.js');
const memoizeAsync = require('../services/memorization');

// Функція для створення slug з назви
const createSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9а-я]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

// Отримати дерево категорій з атрибутами
const getCategoryTreeLocal = memoizeAsync(async () => {
  const allCategories = await prisma.category.findMany({
    include: {
      attributes: {
        include: {
          attribute: {
            include: {
              attributeValues: {
                orderBy: { displayOrder: 'asc' }
              }
            }
          }
        },
        orderBy: { displayOrder: 'asc' }
      }
    },
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
}, {
  strategy: 'TTL',
  ttl: 60000,
  maxSize: 1
});

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

// Отримати всі категорії
const getAllCategories = async (req, res, next) => {
  try {
    const categoryTree = await getCategoryTreeLocal();
    res.status(200).json(categoryTree);
  } catch (err) {
    next(err);
  }
};

// Створити категорію
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

    const slug = createSlug(name.trim());
    
    const newCategory = await prisma.category.create({
      data: {
        name: name.trim(),
        slug,
        parentId: parentId ? parseInt(parentId) : null,
      },
    });
    
    getCategoryTreeLocal.clear();
    res.status(201).json(newCategory);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Category with this name already exists' });
    }
    next(err);
  }
};

// Оновити категорію
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

    const updateData = {
      parentId: newParentId,
    };

    if (name !== undefined) {
      updateData.name = name.trim();
      updateData.slug = createSlug(name.trim());
    }
    
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: updateData,
    });
    
    getCategoryTreeLocal.clear();
    res.status(200).json(updatedCategory);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Category with this name already exists' });
    }
    next(err);
  }
};

// Отримати товари за категорією
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
      include: {
        attributes: {
          include: {
            attribute: true,
            attributeValue: true
          }
        }
      }
    });
    res.status(200).json(products);
  } catch (err) {
    next(err);
  }
};

// Видалити категорію
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
    
    getCategoryTreeLocal.clear();
    res.status(200).json({ message: 'Category successfully deleted' });
  } catch (err) {
    next(err);
  }
};

// Отримати атрибути категорії з успадкованими від батьківських
const getCategoryAttributesWithInherited = async (req, res, next) => {
  const categoryId = parseInt(req.params.id);

  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Збираємо ідентифікатори категорій від поточної до кореневої
    const categoryPath = [];
    let currentCategory = category;
    
    while (currentCategory) {
      categoryPath.unshift(currentCategory.id);
      if (currentCategory.parentId) {
        currentCategory = await prisma.category.findUnique({
          where: { id: currentCategory.parentId }
        });
      } else {
        break;
      }
    }

    // Отримуємо атрибути для всіх категорій в ієрархії
    const attributes = await prisma.categoryAttribute.findMany({
      where: {
        categoryId: { in: categoryPath }
      },
      include: {
        attribute: {
          include: {
            attributeValues: {
              orderBy: { displayOrder: 'asc' }
            }
          }
        },
        category: true
      },
      orderBy: [
        { displayOrder: 'asc' },
        { attribute: { displayOrder: 'asc' } }
      ]
    });

    // Видаляємо дублікати атрибутів (пріоритет має найближча до товару категорія)
    const uniqueAttributes = [];
    const seenAttributeIds = new Set();

    for (const attr of attributes.reverse()) {
      if (!seenAttributeIds.has(attr.attributeId)) {
        uniqueAttributes.unshift(attr);
        seenAttributeIds.add(attr.attributeId);
      }
    }

    res.json(uniqueAttributes);
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
  getCategoryAttributesWithInherited,
};