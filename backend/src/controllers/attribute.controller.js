// ОНОВИТИ ІСНУЮЧИЙ ФАЙЛ: controllers/attribute.controller.js

const prisma = require('../config/prisma.client.js');

// Отримати всі атрибути
const getAllAttributes = async (req, res, next) => {
  try {
    const attributes = await prisma.attribute.findMany({
      include: {
        attributeValues: {
          orderBy: { displayOrder: 'asc' }
        },
        categoryAttributes: {
          include: {
            category: true
          }
        },
        dependsOnAttribute: true,
        dependentAttributes: true
      },
      orderBy: { displayOrder: 'asc' }
    });
    res.json(attributes);
  } catch (err) {
    next(err);
  }
};

// Створити новий атрибут
const createAttribute = async (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'content-manager') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { name, slug, type, isFilterable, isRequired, unit, dependsOn } = req.body;

  if (!name || !slug || !type) {
    return res.status(400).json({ error: 'Name, slug and type are required' });
  }

  try {
    if (dependsOn) {
      const parentAttribute = await prisma.attribute.findUnique({
        where: { id: parseInt(dependsOn) }
      });
      
      if (!parentAttribute) {
        return res.status(400).json({ error: 'Parent attribute not found' });
      }
      
      if (parentAttribute.type !== 'SELECT') {
        return res.status(400).json({ error: 'Parent attribute must be of type SELECT' });
      }
    }

    const newAttribute = await prisma.attribute.create({
      data: {
        name: name.trim(),
        slug: slug.trim(),
        type,
        isFilterable: isFilterable ?? true,
        isRequired: isRequired ?? false,
        unit: unit?.trim() || null,
        dependsOn: dependsOn ? parseInt(dependsOn) : null
      },
      include: {
        attributeValues: true,
        dependsOnAttribute: true,
        dependentAttributes: true
      }
    });
    res.status(201).json(newAttribute);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Attribute with this slug already exists' });
    }
    next(err);
  }
};

// Оновити атрибут
const updateAttribute = async (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'content-manager') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const attributeId = parseInt(req.params.id);
  const { name, type, isFilterable, isRequired, unit, dependsOn } = req.body;

  try {
    if (dependsOn) {
      const parentAttribute = await prisma.attribute.findUnique({
        where: { id: parseInt(dependsOn) }
      });
      
      if (!parentAttribute) {
        return res.status(400).json({ error: 'Parent attribute not found' });
      }
      
      if (parentAttribute.type !== 'SELECT') {
        return res.status(400).json({ error: 'Parent attribute must be of type SELECT' });
      }

      if (parseInt(dependsOn) === attributeId) {
        return res.status(400).json({ error: 'Attribute cannot depend on itself' });
      }
    }

    const updatedAttribute = await prisma.attribute.update({
      where: { id: attributeId },
      data: {
        name: name?.trim(),
        type,
        isFilterable: isFilterable ?? undefined,
        isRequired: isRequired ?? undefined,
        unit: unit?.trim() || null,
        dependsOn: dependsOn !== undefined ? (dependsOn ? parseInt(dependsOn) : null) : undefined
      },
      include: {
        attributeValues: true,
        dependsOnAttribute: true,
        dependentAttributes: true
      }
    });

    res.json(updatedAttribute);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Attribute not found' });
    }
    next(err);
  }
};

// Отримати значення залежного атрибуту на основі батьківського
const getDependentAttributeValues = async (req, res, next) => {
  try {
    const { attributeSlug, parentValueId } = req.params;

    const attribute = await prisma.attribute.findUnique({
      where: { slug: attributeSlug },
      include: {
        dependsOnAttribute: true,
        dependentAttributes: true,
        attributeValues: {
          orderBy: { displayOrder: 'asc' }
        }
      }
    });

    if (!attribute) {
      return res.status(404).json({ error: 'Attribute not found' });
    }

    if (!attribute.dependsOn) {
      return res.json(attribute.attributeValues);
    }

    const productsWithParentValue = await prisma.productAttribute.findMany({
      where: {
        attributeValueId: parseInt(parentValueId),
        attributeId: attribute.dependsOn
      },
      select: { productId: true }
    });

    const productIds = productsWithParentValue.map(p => p.productId);

    if (productIds.length === 0) {
      return res.json([]);
    }

    const usedValues = await prisma.productAttribute.findMany({
      where: {
        attributeId: attribute.id,
        productId: { in: productIds }
      },
      include: {
        attributeValue: true
      },
      distinct: ['attributeValueId']
    });

    const valueStats = await Promise.all(
      usedValues.map(async (item) => {
        const count = await prisma.productAttribute.count({
          where: {
            attributeValueId: item.attributeValueId,
            productId: { in: productIds }
          }
        });

        return {
          ...item.attributeValue,
          count
        };
      })
    );

    res.json(valueStats.filter(v => v.count > 0));
  } catch (err) {
    next(err);
  }
};

// Отримати всі залежні атрибути для категорії
const getCategoryAttributesWithDependencies = async (req, res, next) => {
  const categoryId = parseInt(req.params.categoryId);

  try {
    const getAllParentCategories = async (childId) => {
      const parentIds = [childId];
      let currentId = childId;
      
      while (currentId) {
        const category = await prisma.category.findUnique({
          where: { id: currentId },
          select: { parentId: true }
        });
        
        if (category && category.parentId) {
          parentIds.push(category.parentId);
          currentId = category.parentId;
        } else {
          break;
        }
      }
      
      return parentIds;
    };

    const parentCategoryIds = await getAllParentCategories(categoryId);

    const categoryAttributes = await prisma.categoryAttribute.findMany({
      where: {
        categoryId: { in: parentCategoryIds }
      },
      include: {
        attribute: {
          include: {
            attributeValues: {
              orderBy: { displayOrder: 'asc' }
            },
            dependsOnAttribute: true,
            dependentAttributes: true
          }
        }
      },
      orderBy: { displayOrder: 'asc' }
    });

    const attributeMap = new Map();
    
    const sortedParentIds = parentCategoryIds.sort((a, b) => {
      if (a === categoryId) return -1;
      if (b === categoryId) return 1;
      return 0;
    });

    categoryAttributes.forEach(attr => {
      const priority = sortedParentIds.indexOf(attr.categoryId);
      
      if (!attributeMap.has(attr.attributeId) || 
          attributeMap.get(attr.attributeId).priority > priority) {
        attributeMap.set(attr.attributeId, {
          ...attr,
          priority
        });
      }
    });

    const uniqueAttributes = Array.from(attributeMap.values());

    uniqueAttributes.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return (a.displayOrder || 0) - (b.displayOrder || 0);
    });

    res.json(uniqueAttributes);
  } catch (err) {
    next(err);
  }
};

// Додати значення до атрибуту
const addAttributeValue = async (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'content-manager') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const attributeId = parseInt(req.params.attributeId);
  const { value, displayName, displayOrder } = req.body;

  if (!value) {
    return res.status(400).json({ error: 'Value is required' });
  }

  try {
    const attribute = await prisma.attribute.findUnique({
      where: { id: attributeId }
    });

    if (!attribute) {
      return res.status(404).json({ error: 'Attribute not found' });
    }

    if (attribute.type !== 'SELECT') {
      return res.status(400).json({ error: 'Can only add values to SELECT type attributes' });
    }

    const newValue = await prisma.attributeValue.create({
      data: {
        attributeId,
        value: value.trim(),
        displayName: displayName?.trim() || null,
        displayOrder: displayOrder || 0
      }
    });

    res.status(201).json(newValue);
  } catch (err) {
    next(err);
  }
};

// Прив'язати атрибут до категорії
const assignAttributeToCategory = async (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'content-manager') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { categoryId, attributeId, isRequired, displayOrder } = req.body;

  if (!categoryId || !attributeId) {
    return res.status(400).json({ error: 'categoryId and attributeId are required' });
  }

  try {
    const assignment = await prisma.categoryAttribute.create({
      data: {
        categoryId: parseInt(categoryId),
        attributeId: parseInt(attributeId),
        isRequired: isRequired ?? false,
        displayOrder: displayOrder || 0
      },
      include: {
        category: true,
        attribute: {
          include: {
            attributeValues: true
          }
        }
      }
    });

    res.status(201).json(assignment);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Attribute already assigned to this category' });
    }
    next(err);
  }
};

// Отримати атрибути для конкретної категорії
const getCategoryAttributes = async (req, res, next) => {
  const categoryId = parseInt(req.params.categoryId);

  try {
    const categoryAttributes = await prisma.categoryAttribute.findMany({
      where: { categoryId },
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
    });

    res.json(categoryAttributes);
  } catch (err) {
    next(err);
  }
};

// Видалити атрибут
const deleteAttribute = async (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'content-manager') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const attributeId = parseInt(req.params.id);

  try {
    await prisma.attribute.delete({
      where: { id: attributeId }
    });

    res.json({ message: 'Attribute deleted successfully' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Attribute not found' });
    }
    next(err);
  }
};

// Видалити значення атрибуту
const deleteAttributeValue = async (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'content-manager') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const valueId = parseInt(req.params.valueId);

  try {
    await prisma.attributeValue.delete({
      where: { id: valueId }
    });

    res.json({ message: 'Attribute value deleted successfully' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Attribute value not found' });
    }
    next(err);
  }
};

// Оновити значення атрибуту
const updateAttributeValue = async (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'content-manager') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const valueId = parseInt(req.params.valueId);
  const { value, displayName } = req.body;

  try {
    const updatedValue = await prisma.attributeValue.update({
      where: { id: valueId },
      data: {
        value: value?.trim(),
        displayName: displayName?.trim() || null
      }
    });

    res.json(updatedValue);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Attribute value not found' });
    }
    next(err);
  }
};

// Відв'язати атрибут від категорії
const unassignAttributeFromCategory = async (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'content-manager') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { categoryId, attributeId } = req.body;

  try {
    await prisma.categoryAttribute.deleteMany({
      where: {
        categoryId: parseInt(categoryId),
        attributeId: parseInt(attributeId)
      }
    });

    res.json({ message: 'Attribute unassigned from category successfully' });
  } catch (err) {
    next(err);
  }
};

const reorderAttributes = async (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'content-manager') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { updates } = req.body;

  try {
    const updatePromises = updates.map(update => 
      prisma.attribute.update({
        where: { id: update.id },
        data: { displayOrder: update.displayOrder }
      })
    );

    await Promise.all(updatePromises);
    res.json({ message: 'Attributes reordered successfully' });
  } catch (err) {
    next(err);
  }
};

const reorderAttributeValues = async (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'content-manager') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { updates } = req.body;

  try {
    const updatePromises = updates.map(update => 
      prisma.attributeValue.update({
        where: { id: update.id },
        data: { displayOrder: update.displayOrder }
      })
    );

    await Promise.all(updatePromises);
    res.json({ message: 'Attribute values reordered successfully' });
  } catch (err) {
    next(err);
  }
};

const getCategoryAttributesWithParents = async (req, res, next) => {
  const categoryId = parseInt(req.params.categoryId);

  if (isNaN(categoryId)) {
    return res.status(400).json({ error: 'Invalid category ID' });
  }

  try {
    const getAllParentCategories = async (childId) => {
      const parentIds = [childId];
      let currentId = childId;
      
      while (currentId) {
        const category = await prisma.category.findUnique({
          where: { id: currentId },
          select: { parentId: true }
        });
        
        if (category && category.parentId) {
          parentIds.push(category.parentId);
          currentId = category.parentId;
        } else {
          break;
        }
      }
      
      return parentIds;
    };

    const parentCategoryIds = await getAllParentCategories(categoryId);

    const categoryAttributes = await prisma.categoryAttribute.findMany({
      where: {
        categoryId: { in: parentCategoryIds }
      },
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
    });

    const attributeMap = new Map();
    
    const sortedParentIds = parentCategoryIds.sort((a, b) => {
      if (a === categoryId) return -1;
      if (b === categoryId) return 1;
      return 0;
    });

    categoryAttributes.forEach(attr => {
      const priority = sortedParentIds.indexOf(attr.categoryId);
      
      if (!attributeMap.has(attr.attributeId) || 
          attributeMap.get(attr.attributeId).priority > priority) {
        attributeMap.set(attr.attributeId, {
          ...attr,
          priority
        });
      }
    });

    const uniqueAttributes = Array.from(attributeMap.values());

    uniqueAttributes.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return (a.displayOrder || 0) - (b.displayOrder || 0);
    });

    res.json(uniqueAttributes);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllAttributes,
  createAttribute,
  updateAttribute,
  addAttributeValue,
  updateAttributeValue,
  assignAttributeToCategory,
  unassignAttributeFromCategory,
  getCategoryAttributes,
  getCategoryAttributesWithParents,
  getCategoryAttributesWithDependencies,
  getDependentAttributeValues,
  deleteAttribute,
  deleteAttributeValue,
  reorderAttributes,
  reorderAttributeValues
};