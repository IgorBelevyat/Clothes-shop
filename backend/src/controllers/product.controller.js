const prisma = require('../config/prisma.client.js');

const getAllProducts = async (req, res, next) => {
  const { 
    title, 
    description, 
    price_min, 
    price_max, 
    category,
    page = 1,
    limit = 20,
    sort = 'createdAt',
    order = 'desc',
    ...filters 
  } = req.query;

  try {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    // Базові фільтри
    if (title) {
      where.title = {
        contains: title,
        mode: 'insensitive',
      };
    }
    if (description) {
      where.description = {
        contains: description,
        mode: 'insensitive',
      };
    }
    
    // Фільтр за ціною
    if (price_min || price_max) {
      where.price = {};
      if (price_min) where.price.gte = parseFloat(price_min);
      if (price_max) where.price.lte = parseFloat(price_max);
    }

    // Фільтр за категорією (включаючи підкategорії)
    if (category) {
      const categoryId = parseInt(category);
      
      // Знаходимо всі підкategорії
      const getAllSubcategories = async (parentId) => {
        const subcategories = await prisma.category.findMany({
          where: { parentId },
          select: { id: true }
        });
        
        let allIds = [parentId];
        for (const sub of subcategories) {
          const childIds = await getAllSubcategories(sub.id);
          allIds = allIds.concat(childIds);
        }
        return allIds;
      };

      const categoryIds = await getAllSubcategories(categoryId);
      where.categoryId = { in: categoryIds };
    }

    // Динамічні фільтри за атрибутами
    const attributeFilters = Object.keys(filters).filter(key => 
      key.startsWith('attr_') || key.startsWith('range_')
    );

    if (attributeFilters.length > 0) {
      const attributeConditions = [];

      for (const filterKey of attributeFilters) {
        const filterValue = filters[filterKey];
        if (!filterValue) continue;

        if (filterKey.startsWith('attr_')) {
          // Звичайний атрибут (SELECT, TEXT, BOOLEAN)
          const attributeSlug = filterKey.replace('attr_', '');
          
          const attribute = await prisma.attribute.findUnique({
            where: { slug: attributeSlug }
          });

          if (attribute) {
            if (attribute.type === 'SELECT') {
              const attributeValueIds = Array.isArray(filterValue) 
                ? filterValue.map(id => parseInt(id))
                : [parseInt(filterValue)];
                
              attributeConditions.push({
                attributeId: attribute.id,
                attributeValueId: { in: attributeValueIds }
              });
            } else if (attribute.type === 'TEXT') {
              attributeConditions.push({
                attributeId: attribute.id,
                textValue: { contains: filterValue, mode: 'insensitive' }
              });
            } else if (attribute.type === 'BOOLEAN') {
              attributeConditions.push({
                attributeId: attribute.id,
                booleanValue: filterValue === 'true'
              });
            } else if (attribute.type === 'NUMBER') {
              attributeConditions.push({
                attributeId: attribute.id,
                numberValue: parseFloat(filterValue)
              });
            }
          }
        } else if (filterKey.startsWith('range_')) {
          // Діапазонний фільтр (RANGE, NUMBER)
          const attributeSlug = filterKey.replace('range_', '');
          const [minValue, maxValue] = filterValue.split(',');
          
          const attribute = await prisma.attribute.findUnique({
            where: { slug: attributeSlug }
          });

          if (attribute && (minValue || maxValue)) {
            const rangeCondition = { attributeId: attribute.id, numberValue: {} };
            if (minValue) rangeCondition.numberValue.gte = parseFloat(minValue);
            if (maxValue) rangeCondition.numberValue.lte = parseFloat(maxValue);
            
            attributeConditions.push(rangeCondition);
          }
        }
      }

      if (attributeConditions.length > 0) {
        where.attributes = {
          some: {
            OR: attributeConditions
          }
        };
      }
    }

    // Сортування
    const orderBy = {};
    if (sort === 'price' || sort === 'createdAt' || sort === 'viewCount') {
      orderBy[sort] = order === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          attributes: {
            include: {
              attribute: {
                include: {
                  attributeValues: {
                    orderBy: { displayOrder: 'asc' }
                  }
                }
              },
              attributeValue: true
            }
          }
        },
        orderBy,
        skip,
        take: parseInt(limit)
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      products,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    next(err);
  }
};

const createProduct = async (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'content-manager') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { title, description, price, image, categoryId, attributes } = req.body;

  if (!title || !description || price === undefined || !image || categoryId === undefined) {
    return res.status(400).json({ error: 'All fields (title, description, price, image, categoryId) are required' });
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id: parseInt(categoryId) },
      include: {
        attributes: {
          include: {
            attribute: true
          }
        }
      }
    });
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Перевіряємо обов'язкові атрибути
    const requiredAttributes = category.attributes.filter(ca => ca.isRequired);
    for (const reqAttr of requiredAttributes) {
      const attributeData = attributes && attributes[reqAttr.attribute.slug];
      if (!attributeData && attributeData !== 0 && attributeData !== false) {
        return res.status(400).json({ 
          error: `Required attribute '${reqAttr.attribute.name}' is missing` 
        });
      }
    }

    // Створюємо продукт
    const newProduct = await prisma.product.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        image,
        categoryId: parseInt(categoryId),
      },
    });

    // Додаємо атрибути продукту
    if (attributes) {
      const productAttributes = [];
      
      for (const [attributeSlug, value] of Object.entries(attributes)) {
        // Пропускаємо порожні значення, але зберігаємо 0 та false
        if (value === null || value === undefined || value === '') continue;
        
        const attribute = await prisma.attribute.findUnique({
          where: { slug: attributeSlug }
        });

        if (!attribute) continue;

        const attributeData = {
          productId: newProduct.id,
          attributeId: attribute.id,
        };

        switch (attribute.type) {
          case 'SELECT':
            attributeData.attributeValueId = parseInt(value);
            break;
          case 'TEXT':
            attributeData.textValue = value;
            break;
          case 'NUMBER':
          case 'RANGE':
            attributeData.numberValue = parseFloat(value);
            break;
          case 'BOOLEAN':
            attributeData.booleanValue = value === 'true' || value === true;
            break;
        }

        productAttributes.push(attributeData);
      }

      if (productAttributes.length > 0) {
        await prisma.productAttribute.createMany({
          data: productAttributes
        });
      }
    }

    // Повертаємо створений продукт з атрибутами
    const createdProduct = await prisma.product.findUnique({
      where: { id: newProduct.id },
      include: {
        category: true,
        attributes: {
          include: {
            attribute: {
              include: {
                attributeValues: {
                  orderBy: { displayOrder: 'asc' }
                }
              }
            },
            attributeValue: true
          }
        }
      }
    });

    res.status(201).json(createdProduct);
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

  const { title, description, price, image, categoryId, attributes } = req.body;

  try {
    const productToUpdate = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        attributes: true
      }
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

    // Оновлюємо основні дані продукту
    if (Object.keys(dataToUpdate).length > 0) {
      await prisma.product.update({
        where: { id: productId },
        data: dataToUpdate,
      });
    }

    // Оновлюємо атрибути
    if (attributes !== undefined) {
      // Видаляємо старі атрибути
      await prisma.productAttribute.deleteMany({
        where: { productId }
      });

      // Додаємо нові атрибути
      const productAttributes = [];
      
      for (const [attributeSlug, value] of Object.entries(attributes)) {
        // Пропускаємо порожні значення, але зберігаємо 0 та false
        if (value === null || value === undefined || value === '') continue;
        
        const attribute = await prisma.attribute.findUnique({
          where: { slug: attributeSlug }
        });

        if (!attribute) continue;

        const attributeData = {
          productId,
          attributeId: attribute.id,
        };

        switch (attribute.type) {
          case 'SELECT':
            if (value) attributeData.attributeValueId = parseInt(value);
            break;
          case 'TEXT':
            if (value) attributeData.textValue = value;
            break;
          case 'NUMBER':
          case 'RANGE':
            if (value !== null && value !== '') attributeData.numberValue = parseFloat(value);
            break;
          case 'BOOLEAN':
            attributeData.booleanValue = value === 'true' || value === true;
            break;
        }

        // Додаємо лише якщо є значення
        if (attributeData.attributeValueId || attributeData.textValue || 
            attributeData.numberValue !== undefined || attributeData.booleanValue !== undefined) {
          productAttributes.push(attributeData);
        }
      }

      if (productAttributes.length > 0) {
        await prisma.productAttribute.createMany({
          data: productAttributes
        });
      }
    }

    // Повертаємо оновлений продукт
    const updatedProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        attributes: {
          include: {
            attribute: {
              include: {
                attributeValues: {
                  orderBy: { displayOrder: 'asc' }
                }
              }
            },
            attributeValue: true
          }
        }
      }
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

// Отримати фільтри для категорії
// ОНОВИТИ в product.controller.js функцію getCategoryFilters
// У product.controller.js ЗАМІНІТЬ функцію getCategoryFilters на цю:

const getCategoryFilters = async (req, res, next) => {
  const categoryId = parseInt(req.params.categoryId);

  if (isNaN(categoryId)) {
    return res.status(400).json({ error: 'Invalid category ID' });
  }

  try {
    // Отримуємо атрибути для категорії, використовуючи існуючий API
    const filtersRes = await fetch(`http://localhost:3001/api/attributes/category/${categoryId}/with-dependencies`, {
      headers: {
        'Cookie': req.headers.cookie || ''
      }
    });

    if (!filtersRes.ok) {
      throw new Error('Failed to fetch filters');
    }

    const filters = await filtersRes.json();

    // Функція для отримання всіх підкategорій
    const getAllSubcategories = async (parentId) => {
      const subcategories = await prisma.category.findMany({
        where: { parentId },
        select: { id: true }
      });
      
      let allIds = [parentId];
      for (const sub of subcategories) {
        const childIds = await getAllSubcategories(sub.id);
        allIds = allIds.concat(childIds);
      }
      return allIds;
    };

    const allSubcategoryIds = await getAllSubcategories(categoryId);

    // Обробляємо кожен фільтр та додаємо статистику
    const filtersWithStats = await Promise.all(
      filters.map(async (filterData) => {
        const attr = filterData.attribute;
        
        if (attr.type === 'SELECT') {
          // Для SELECT атрибутів підраховуємо кількість товарів для кожного значення
          const valueCounts = await Promise.all(
            attr.attributeValues.map(async (value) => {
              const count = await prisma.product.count({
                where: {
                  categoryId: { in: allSubcategoryIds },
                  attributes: {
                    some: {
                      attributeValueId: value.id
                    }
                  }
                }
              });
              return { ...value, count };
            })
          );
          
          return {
            ...filterData,
            attribute: {
              ...attr,
              attributeValues: valueCounts // Зберігаємо всі значення з підрахунками
            }
          };
        } else if (attr.type === 'NUMBER' || attr.type === 'RANGE') {
          // Для числових атрибутів знаходимо мін/макс значення
          const stats = await prisma.productAttribute.aggregate({
            where: {
              attributeId: attr.id,
              product: {
                categoryId: { in: allSubcategoryIds }
              },
              numberValue: { not: null }
            },
            _min: { numberValue: true },
            _max: { numberValue: true }
          });
          
          return {
            ...filterData,
            attribute: {
              ...attr,
              minValue: stats._min.numberValue,
              maxValue: stats._max.numberValue
            }
          };
        } else if (attr.type === 'TEXT' || attr.type === 'BOOLEAN') {
          // Для TEXT і BOOLEAN перевіряємо наявність товарів
          const hasProducts = await prisma.product.count({
            where: {
              categoryId: { in: allSubcategoryIds },
              attributes: {
                some: {
                  attributeId: attr.id
                }
              }
            }
          });
          
          return {
            ...filterData,
            attribute: {
              ...attr,
              hasProducts: hasProducts > 0
            }
          };
        }
        
        return filterData;
      })
    );

    // Фільтруємо тільки ті атрибути, які мають релевантні дані
    const validFilters = filtersWithStats.filter(f => {
      if (f.attribute.type === 'SELECT') {
        return f.attribute.attributeValues.some(v => v.count > 0);
      } else if (f.attribute.type === 'NUMBER' || f.attribute.type === 'RANGE') {
        return f.attribute.minValue !== null && f.attribute.maxValue !== null;
      } else if (f.attribute.type === 'TEXT' || f.attribute.type === 'BOOLEAN') {
        return f.attribute.hasProducts;
      }
      return true;
    });

    res.json(validFilters);
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
  getCategoryFilters,
};