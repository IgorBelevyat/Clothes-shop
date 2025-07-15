//ProductTable.js

import React, { useState, useEffect, useCallback } from 'react';
import './ProductsTable.css';
import AdvancedFilterComponent from './AdvancedFilterComponent';

export default function ProductsTable() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [tempProduct, setTempProduct] = useState({});
  const [tempAttributes, setTempAttributes] = useState({});
  const [categoryAttributes, setCategoryAttributes] = useState([]);
  
  // НОВІ СТАНИ ДЛЯ МНОЖИННИХ ЗОБРАЖЕНЬ
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  
  // Фільтри
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [currentFilters, setCurrentFilters] = useState({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  
  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [currentFilters, pagination.page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Формуємо параметри запиту
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...currentFilters
      });

      if (selectedCategoryId) {
        params.set('category', selectedCategoryId);
      }

      const res = await fetch(`http://localhost:3001/api/products?${params.toString()}`, {
        credentials: 'include'
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await res.json();
      setProducts(data.products || data);
      
      // Якщо є мета-дані пагінації
      if (data.meta) {
        setPagination(prev => ({
          ...prev,
          total: data.meta.total,
          totalPages: data.meta.totalPages
        }));
      }
      
      setFilteredProducts(data.products || data);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/categories', {
        credentials: 'include'
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchCategoryAttributes = async (categoryId) => {
    try {
      // Використовуємо новий ендпоінт для отримання атрибутів з батьківських категорій
      const res = await fetch(`http://localhost:3001/api/attributes/category/${categoryId}/with-parents`, {
        credentials: 'include'
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch category attributes');
      }
      
      const data = await res.json();
      setCategoryAttributes(data);
    } catch (err) {
      console.error("Error fetching category attributes:", err);
      setCategoryAttributes([]);
    }
  };

  const handleFiltersChange = useCallback((filters) => {
    setCurrentFilters(filters);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setCurrentFilters({}); // Clear attribute filters when changing category
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const flattenCategories = (categories, level = 0, result = []) => {
    categories.forEach(category => {
      result.push({
        id: category.id,
        name: category.name,
        level
      });
      
      if (category.children && category.children.length > 0) {
        flattenCategories(category.children, level + 1, result);
      }
    });
    
    return result;
  };
  
  const flatCategories = flattenCategories(categories);

  const startEditing = async (product) => {
    setEditingProduct(product.id);
    setTempProduct({ ...product });
    
    // Підготовка атрибутів для редагування з поточними значеннями
    const attributesObj = {};
    if (product.attributes) {
      product.attributes.forEach(attr => {
        if (attr.attribute.type === 'SELECT') {
          attributesObj[attr.attribute.slug] = attr.attributeValueId?.toString() || '';
        } else if (attr.attribute.type === 'TEXT') {
          attributesObj[attr.attribute.slug] = attr.textValue || '';
        } else if (attr.attribute.type === 'NUMBER' || attr.attribute.type === 'RANGE') {
          attributesObj[attr.attribute.slug] = attr.numberValue?.toString() || '';
        } else if (attr.attribute.type === 'BOOLEAN') {
          attributesObj[attr.attribute.slug] = attr.booleanValue?.toString() || '';
        }
      });
    }
    setTempAttributes(attributesObj);
    
    // НОВЕ: Підготовка існуючих зображень
    setExistingImages(product.images || []);
    setImageFiles([]);
    setImagePreviews([]);
    setImagesToDelete([]);
    
    // Завантажуємо атрибути категорії (включаючи батьківські)
    if (product.categoryId) {
      await fetchCategoryAttributes(product.categoryId);
    }
  };

  const cancelEditing = () => {
    setEditingProduct(null);
    setTempProduct({});
    setTempAttributes({});
    setCategoryAttributes([]);
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    setImagesToDelete([]);
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    const updatedProduct = {
      ...tempProduct,
      [name]: name === 'price' ? parseFloat(value) : 
              name === 'categoryId' ? parseInt(value) : value
    };
    
    setTempProduct(updatedProduct);
    
    // Якщо змінилася категорія, завантажуємо нові атрибути та зберігаємо поточні значення
    if (name === 'categoryId' && value) {
      const oldAttributes = { ...tempAttributes };
      await fetchCategoryAttributes(parseInt(value));
      
      // Зберігаємо тільки ті атрибути, які є в новій категорії
      // (це буде оновлено після завантаження нових атрибутів)
      setTempAttributes(oldAttributes);
    }
  };

  const handleAttributeChange = (attributeSlug, value, type) => {
    setTempAttributes(prev => {
      const newAttributes = { ...prev };
      
      if (type === 'BOOLEAN') {
        newAttributes[attributeSlug] = value === 'true';
      } else if (type === 'NUMBER' || type === 'RANGE') {
        newAttributes[attributeSlug] = value ? parseFloat(value) : null;
      } else {
        newAttributes[attributeSlug] = value || null;
      }
      
      return newAttributes;
    });
  };

  // НОВІ ФУНКЦІЇ ДЛЯ РОБОТИ З МНОЖИННИМИ ЗОБРАЖЕННЯМИ
  const handleMultipleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImageFiles(prev => [...prev, ...files]);
      
      // Створюємо preview для нових файлів
      const newPreviews = files.map(file => ({
        file,
        url: URL.createObjectURL(file),
        isNew: true
      }));
      
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeNewImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      const newPreviews = prev.filter((_, i) => i !== index);
      // Очищаємо URL для звільнення пам'яті
      if (prev[index]) {
        URL.revokeObjectURL(prev[index].url);
      }
      return newPreviews;
    });
  };

  const removeExistingImage = (imageId) => {
    setImagesToDelete(prev => [...prev, imageId]);
    setExistingImages(prev => prev.filter(img => img.id !== imageId));
  };

  const setMainImage = (imageId, isExisting = true) => {
    if (isExisting) {
      setExistingImages(prev => prev.map(img => ({
        ...img,
        isMain: img.id === imageId
      })));
    } else {
      setImagePreviews(prev => prev.map((preview, index) => ({
        ...preview,
        isMain: index === imageId
      })));
    }
  };

  const uploadImages = async () => {
    if (imageFiles.length === 0) return [];
    
    const uploadedUrls = [];
    
    for (const file of imageFiles) {
      const formData = new FormData();
      formData.append('image', file);
      
      try {
        const res = await fetch('http://localhost:3001/api/products/upload', {
          method: 'POST',
          credentials: 'include',
          body: formData
        });
        
        if (!res.ok) {
          throw new Error('Image upload failed');
        }
        
        const data = await res.json();
        uploadedUrls.push(data.url);
      } catch (err) {
        console.error("Error uploading image:", err);
        alert('Failed to upload image: ' + file.name);
        return null;
      }
    }
    
    return uploadedUrls;
  };

  const saveProduct = async () => {
    try {
      // Завантажуємо нові зображення
      const uploadedImageUrls = await uploadImages();
      if (uploadedImageUrls === null) return; // Помилка завантаження
      
      // Підготовуємо дані про зображення
      const imageData = {
        newImages: uploadedImageUrls,
        existingImages: existingImages,
        imagesToDelete: imagesToDelete
      };
      
      const updatedProduct = {
        ...tempProduct,
        attributes: tempAttributes,
        images: imageData
      };
      
      const res = await fetch(`http://localhost:3001/api/products/${tempProduct.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update product');
      }
      
      // Оновлюємо список продуктів
      fetchProducts();
      cancelEditing();
    } catch (err) {
      console.error("Error updating product:", err);
      alert(err.message || 'Failed to update product');
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    try {
      const res = await fetch(`http://localhost:3001/api/products/${productId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete product');
      }
      
      fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
      alert(err.message || 'Failed to delete product');
    }
  };

  const getCategoryName = (categoryId) => {
    const category = flatCategories.find(c => c.id === categoryId);
    return category ? category.name : 'Uncategorized';
  };

  const renderProductAttributes = (product) => {
    if (!product.attributes || product.attributes.length === 0) {
      return <span style={{ color: '#999', fontStyle: 'italic' }}>No attributes</span>;
    }

    return (
      <div style={{ fontSize: '12px' }}>
        {product.attributes.slice(0, 3).map(attr => (
          <div key={attr.id} style={{ marginBottom: '2px' }}>
            <strong>{attr.attribute.name}:</strong>{' '}
            {attr.attributeValue ? 
              (attr.attributeValue.displayName || attr.attributeValue.value) :
              attr.textValue || attr.numberValue || (attr.booleanValue ? 'Yes' : 'No')
            }
          </div>
        ))}
        {product.attributes.length > 3 && (
          <div style={{ color: '#666' }}>
            +{product.attributes.length - 3} more...
          </div>
        )}
      </div>
    );
  };

  // НОВЕ: Відображення швидких характеристик
  const renderQuickSpecs = (product) => {
    const specs = [];
    if (product.mileage) specs.push(`🚗 ${product.mileage}`);
    if (product.transmission) specs.push(`⚙️ ${product.transmission}`);
    if (product.wheelbase) specs.push(`🚛 ${product.wheelbase}`);
    if (product.fuelType) specs.push(`⛽ ${product.fuelType}`);
    
    if (specs.length === 0) {
      return <span style={{ color: '#999', fontStyle: 'italic' }}>No quick specs</span>;
    }
    
    return (
      <div style={{ fontSize: '11px', lineHeight: '1.3' }}>
        {specs.map((spec, index) => (
          <div key={index}>{spec}</div>
        ))}
      </div>
    );
  };

  const renderAttributeEditForm = () => {
    if (!categoryAttributes || categoryAttributes.length === 0) {
      return (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '4px',
          fontSize: '12px',
          color: '#666'
        }}>
          No attributes for this category
        </div>
      );
    }

    return (
      <div style={{ 
        padding: '10px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '4px',
        maxHeight: '200px',
        overflowY: 'auto'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '12px' }}>
          Product Attributes:
        </div>
        {categoryAttributes.map(catAttr => {
          const attr = catAttr.attribute;
          const currentValue = tempAttributes[attr.slug];
          
          return (
            <div key={attr.id} style={{ marginBottom: '8px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '500' }}>
                {attr.name}
                {catAttr.isRequired && <span style={{ color: 'red' }}>*</span>}:
              </label>
              
              {attr.type === 'SELECT' && (
                <select
                  value={currentValue || ''}
                  onChange={(e) => handleAttributeChange(attr.slug, e.target.value, attr.type)}
                  style={{ width: '100%', padding: '4px', fontSize: '11px' }}
                >
                  <option value="">Select {attr.name}</option>
                  {attr.attributeValues && attr.attributeValues.map(value => (
                    <option key={value.id} value={value.id}>
                      {value.displayName || value.value}
                    </option>
                  ))}
                </select>
              )}
              
              {attr.type === 'TEXT' && (
                <input
                  type="text"
                  value={currentValue || ''}
                  onChange={(e) => handleAttributeChange(attr.slug, e.target.value, attr.type)}
                  placeholder={`Enter ${attr.name}`}
                  style={{ width: '100%', padding: '4px', fontSize: '11px' }}
                />
              )}
              
              {(attr.type === 'NUMBER' || attr.type === 'RANGE') && (
                <div>
                  <input
                    type="number"
                    step="0.01"
                    value={currentValue || ''}
                    onChange={(e) => handleAttributeChange(attr.slug, e.target.value, attr.type)}
                    placeholder={`Enter ${attr.name}`}
                    style={{ width: '100%', padding: '4px', fontSize: '11px' }}
                  />
                  {attr.unit && (
                    <span style={{ fontSize: '10px', color: '#666' }}>
                      Unit: {attr.unit}
                    </span>
                  )}
                </div>
              )}
              
              {attr.type === 'BOOLEAN' && (
                <select
                  value={currentValue !== undefined ? currentValue.toString() : ''}
                  onChange={(e) => handleAttributeChange(attr.slug, e.target.value, attr.type)}
                  style={{ width: '100%', padding: '4px', fontSize: '11px' }}
                >
                  <option value="">Not specified</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // НОВЕ: Форма редагування швидких характеристик
  const renderQuickSpecsEditForm = () => {
    return (
      <div style={{ 
        padding: '10px', 
        backgroundColor: '#f0f8ff', 
        borderRadius: '4px',
        marginBottom: '10px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '12px', color: '#2c5aa0' }}>
          Quick Specs:
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '500' }}>
              Mileage:
            </label>
            <input
              type="text"
              name="mileage"
              value={tempProduct.mileage || ''}
              onChange={handleChange}
              placeholder="e.g. 127 тис. км"
              style={{ width: '100%', padding: '4px', fontSize: '11px' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '500' }}>
              Transmission:
            </label>
            <select
              name="transmission"
              value={tempProduct.transmission || ''}
              onChange={handleChange}
              style={{ width: '100%', padding: '4px', fontSize: '11px' }}
            >
              <option value="">Select type</option>
              <option value="Автомат">Автомат</option>
              <option value="Механіка">Механіка</option>
              <option value="Робот">Робот</option>
              <option value="Варіатор">Варіатор</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '500' }}>
              Wheelbase:
            </label>
            <input
              type="text"
              name="wheelbase"
              value={tempProduct.wheelbase || ''}
              onChange={handleChange}
              placeholder="e.g. 4x2, 6x4"
              style={{ width: '100%', padding: '4px', fontSize: '11px' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '500' }}>
              Fuel Type:
            </label>
            <select
              name="fuelType"
              value={tempProduct.fuelType || ''}
              onChange={handleChange}
              style={{ width: '100%', padding: '4px', fontSize: '11px' }}
            >
              <option value="">Select type</option>
              <option value="Дизель">Дизель</option>
              <option value="Бензин">Бензин</option>
              <option value="Газ">Газ</option>
              <option value="Електро">Електро</option>
              <option value="Гібрид">Гібрид</option>
            </select>
          </div>
        </div>
      </div>
    );
  };

  // НОВЕ: Форма редагування зображень
  const renderImageEditForm = () => {
    return (
      <div style={{ 
        padding: '10px', 
        backgroundColor: '#fff5f5', 
        borderRadius: '4px',
        marginBottom: '10px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '12px', color: '#dc3545' }}>
          Images:
        </div>
        
        {/* Існуючі зображення */}
        {existingImages.length > 0 && (
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '11px', marginBottom: '5px' }}>Existing Images:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {existingImages.map(img => (
                <div key={img.id} style={{ position: 'relative', border: img.isMain ? '2px solid #007bff' : '1px solid #ddd', borderRadius: '4px' }}>
                  <img 
                    src={img.imageUrl} 
                    alt="Product" 
                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                  />
                  <button
                    onClick={() => removeExistingImage(img.id)}
                    style={{ 
                      position: 'absolute', 
                      top: '-5px', 
                      right: '-5px', 
                      width: '20px', 
                      height: '20px', 
                      borderRadius: '50%', 
                      background: '#dc3545', 
                      color: 'white', 
                      border: 'none', 
                      fontSize: '12px', 
                      cursor: 'pointer' 
                    }}
                  >
                    ×
                  </button>
                  <button
                    onClick={() => setMainImage(img.id, true)}
                    style={{ 
                      position: 'absolute', 
                      bottom: '-5px', 
                      left: '-5px', 
                      padding: '2px 4px', 
                      fontSize: '8px', 
                      background: img.isMain ? '#007bff' : '#6c757d', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '3px', 
                      cursor: 'pointer' 
                    }}
                  >
                    {img.isMain ? 'MAIN' : 'SET MAIN'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Нові зображення для завантаження */}
        {imagePreviews.length > 0 && (
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '11px', marginBottom: '5px' }}>New Images to Upload:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {imagePreviews.map((preview, index) => (
                <div key={index} style={{ position: 'relative', border: preview.isMain ? '2px solid #28a745' : '1px solid #ddd', borderRadius: '4px' }}>
                  <img 
                    src={preview.url} 
                    alt="Preview" 
                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                  />
                  <button
                    onClick={() => removeNewImage(index)}
                    style={{ 
                      position: 'absolute', 
                      top: '-5px', 
                      right: '-5px', 
                      width: '20px', 
                      height: '20px', 
                      borderRadius: '50%', 
                      background: '#dc3545', 
                      color: 'white', 
                      border: 'none', 
                      fontSize: '12px', 
                      cursor: 'pointer' 
                    }}
                  >
                    ×
                  </button>
                  <button
                    onClick={() => setMainImage(index, false)}
                    style={{ 
                      position: 'absolute', 
                      bottom: '-5px', 
                      left: '-5px', 
                      padding: '2px 4px', 
                      fontSize: '8px', 
                      background: preview.isMain ? '#28a745' : '#6c757d', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '3px', 
                      cursor: 'pointer' 
                    }}
                  >
                    {preview.isMain ? 'MAIN' : 'SET MAIN'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Кнопка додавання нових зображень */}
        <input 
          type="file" 
          accept="image/*" 
          multiple
          onChange={handleMultipleFileChange} 
          style={{ fontSize: '11px', width: '100%' }}
        />
      </div>
    );
  };

  const changePage = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="products-table-container">
      <h3>Manage Products</h3>
      
      {/* Селектор категорії */}
      <div className="category-selector" style={{ marginBottom: '20px' }}>
        <label>Filter by Category:</label>
        <select 
          value={selectedCategoryId} 
          onChange={(e) => handleCategorySelect(e.target.value)}
          style={{
            marginLeft: '10px',
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '14px'
          }}
        >
          <option value="">All Categories</option>
          {flatCategories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {'-'.repeat(cat.level)} {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Розширена система фільтрів */}
      <AdvancedFilterComponent 
        categoryId={selectedCategoryId}
        onFiltersChange={handleFiltersChange}
      />

      {loading ? (
        <div className="loading">Loading products...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <>
          <table className="products-table">
            <thead>
              <tr>
                <th>Images</th>
                <th>Title</th>
                <th>Description</th>
                <th>Price</th>
                <th>Category</th>
                <th>Quick Specs</th>
                <th>Attributes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-products">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={product.id} className={editingProduct === product.id ? 'editing' : ''}>
                    <td className="product-image-cell">
                      {editingProduct === product.id ? (
                        renderImageEditForm()
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', maxWidth: '120px' }}>
                          {product.images && product.images.length > 0 ? 
                            product.images.slice(0, 4).map((img, index) => (
                              <img 
                                key={img.id || index}
                                src={img.imageUrl || img}
                                alt={product.title} 
                                style={{ 
                                  width: index === 0 ? '60px' : '28px', 
                                  height: index === 0 ? '60px' : '28px', 
                                  objectFit: 'cover', 
                                  borderRadius: '4px',
                                  border: img.isMain ? '2px solid #007bff' : '1px solid #ddd'
                                }}
                              />
                            )) : 
                            <div style={{ 
                              width: '60px', 
                              height: '60px', 
                              backgroundColor: '#f8f9fa', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              borderRadius: '4px',
                              fontSize: '10px',
                              color: '#666'
                            }}>
                              No Image
                            </div>
                          }
                          {product.images && product.images.length > 4 && (
                            <div style={{ 
                              width: '28px', 
                              height: '28px', 
                              backgroundColor: '#007bff', 
                              color: 'white', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              borderRadius: '4px',
                              fontSize: '10px'
                            }}>
                              +{product.images.length - 4}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td>
                      {editingProduct === product.id ? (
                        <input 
                          type="text" 
                          name="title" 
                          value={tempProduct.title} 
                          onChange={handleChange} 
                          className="edit-input"
                        />
                      ) : (
                        product.title
                      )}
                    </td>
                    <td className="description-cell">
                      {editingProduct === product.id ? (
                        <textarea 
                          name="description" 
                          value={tempProduct.description} 
                          onChange={handleChange} 
                          className="edit-textarea"
                        />
                      ) : (
                        <div className="description-text">{product.description}</div>
                      )}
                    </td>
                    <td>
                      {editingProduct === product.id ? (
                        <input 
                          type="number" 
                          step="0.01" 
                          name="price" 
                          value={tempProduct.price} 
                          onChange={handleChange} 
                          className="edit-input price-input"
                        />
                      ) : (
                        `${product.price.toFixed(2)}`
                      )}
                    </td>
                    <td>
                      {editingProduct === product.id ? (
                        <select 
                          name="categoryId" 
                          value={tempProduct.categoryId || ''} 
                          onChange={handleChange} 
                          className="edit-select"
                        >
                          <option value="">No category</option>
                          {flatCategories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                              {'-'.repeat(cat.level)} {cat.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        product.categoryId ? getCategoryName(product.categoryId) : 'Uncategorized'
                      )}
                    </td>
                    <td className="quick-specs-cell">
                      {editingProduct === product.id ? (
                        renderQuickSpecsEditForm()
                      ) : (
                        renderQuickSpecs(product)
                      )}
                    </td>
                    <td className="attributes-cell">
                      {editingProduct === product.id ? (
                        renderAttributeEditForm()
                      ) : (
                        renderProductAttributes(product)
                      )}
                    </td>
                    <td className="actions-cell">
                      {editingProduct === product.id ? (
                        <>
                          <button 
                            onClick={saveProduct} 
                            className="save-btn"
                            title="Save changes"
                          >
                            💾
                          </button>
                          <button 
                            onClick={cancelEditing} 
                            className="cancel-btn"
                            title="Cancel"
                          >
                            ❌
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={() => startEditing(product)} 
                            className="edit-btn"
                            title="Edit product"
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={() => deleteProduct(product.id)} 
                            className="delete-btn"
                            title="Delete product"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Пагінація */}
          {pagination.totalPages > 1 && (
            <div className="pagination" style={{ 
              marginTop: '20px', 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '10px' 
            }}>
              <button 
                onClick={() => changePage(pagination.page - 1)}
                disabled={pagination.page === 1}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: pagination.page === 1 ? 'not-allowed' : 'pointer',
                  opacity: pagination.page === 1 ? 0.5 : 1
                }}
              >
                Previous
              </button>
              
              <span style={{ 
                padding: '8px 12px', 
                alignSelf: 'center',
                color: '#666'
              }}>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              
              <button 
                onClick={() => changePage(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: pagination.page === pagination.totalPages ? 'not-allowed' : 'pointer',
                  opacity: pagination.page === pagination.totalPages ? 0.5 : 1
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}