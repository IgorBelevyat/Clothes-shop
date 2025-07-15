// РЕДАГУВАТИ ІСНУЮЧИЙ ФАЙЛ: AddProductForm.js

import React, { useState, useEffect } from 'react';
import './AddProductForm.css';

export default function AddProductForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoryAttributes, setCategoryAttributes] = useState([]);
  const [attributeValues, setAttributeValues] = useState({});
  
  // НОВІ СТАНИ ДЛЯ МНОЖИННИХ ЗОБРАЖЕНЬ
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  
  // НОВІ ПОЛЯ ДЛЯ ШВИДКИХ ХАРАКТЕРИСТИК
  const [mileage, setMileage] = useState('');
  const [transmission, setTransmission] = useState('');
  const [wheelbase, setWheelbase] = useState('');
  const [fuelType, setFuelType] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categoryId) {
      fetchCategoryAttributes(categoryId);
    } else {
      setCategoryAttributes([]);
      setAttributeValues({});
    }
  }, [categoryId]);

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
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
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryAttributes = async (catId) => {
    try {
      const res = await fetch(`http://localhost:3001/api/categories/${catId}/attributes`, {
        credentials: 'include'
      });
      if (!res.ok) {
        throw new Error('Failed to fetch category attributes');
      }
      const data = await res.json();
      setCategoryAttributes(data);
      
      setAttributeValues({});
    } catch (err) {
      console.error("Error fetching category attributes:", err);
      setCategoryAttributes([]);
    }
  };

  // НОВІ ФУНКЦІЇ ДЛЯ РОБОТИ З МНОЖИННИМИ ЗОБРАЖЕННЯМИ
  const handleMultipleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImageFiles(prev => [...prev, ...files]);
      
      // Створюємо preview для нових файлів
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
      
      // Якщо це перші зображення, встановлюємо перше як головне
      if (imageFiles.length === 0) {
        setMainImageIndex(0);
      }
    }
  };

  const removeImage = (index) => {
    // Видаляємо файл та preview
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    
    // Очищаємо URL для звільнення пам'яті
    if (imagePreviews[index]) {
      URL.revokeObjectURL(imagePreviews[index]);
    }
    
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    
    // Коригуємо індекс головного зображення
    if (mainImageIndex === index) {
      setMainImageIndex(0); // Встановлюємо перше як головне
    } else if (mainImageIndex > index) {
      setMainImageIndex(prev => prev - 1);
    }
  };

  const setMainImage = (index) => {
    setMainImageIndex(index);
  };

  const handleAttributeChange = (attributeSlug, value) => {
    setAttributeValues(prev => ({
      ...prev,
      [attributeSlug]: value
    }));
  };

  const flattenCategories = (categories, level = 0, result = []) => {
    categories.forEach(category => {
      result.push({
        id: category.id,
        name: category.name,
        level: level
      });
      
      if (category.children && category.children.length > 0) {
        flattenCategories(category.children, level + 1, result);
      }
    });
    
    return result;
  };

  const renderAttributeInput = (categoryAttribute) => {
    const attr = categoryAttribute.attribute;
    const value = attributeValues[attr.slug] || '';

    switch (attr.type) {
      case 'SELECT':
        return (
          <select
            value={value}
            onChange={(e) => handleAttributeChange(attr.slug, e.target.value)}
            required={categoryAttribute.isRequired}
          >
            <option value="">Оберіть {attr.name.toLowerCase()}</option>
            {attr.attributeValues.map(attrValue => (
              <option key={attrValue.id} value={attrValue.id}>
                {attrValue.displayName || attrValue.value}
              </option>
            ))}
          </select>
        );

      case 'TEXT':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleAttributeChange(attr.slug, e.target.value)}
            placeholder={`Введіть ${attr.name.toLowerCase()}`}
            required={categoryAttribute.isRequired}
          />
        );

      case 'NUMBER':
        return (
          <input
            type="number"
            step="0.01"
            value={value}
            onChange={(e) => handleAttributeChange(attr.slug, e.target.value)}
            placeholder={`Введіть ${attr.name.toLowerCase()}`}
            required={categoryAttribute.isRequired}
          />
        );

      case 'BOOLEAN':
        return (
          <div className="checkbox-container">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={value === 'true' || value === true}
                onChange={(e) => handleAttributeChange(attr.slug, e.target.checked)}
                className="checkbox-input"
              />
              <span>{attr.name}</span>
            </label>
          </div>
        );

      case 'RANGE':
        return (
          <div className="range-inputs">
            <input
              type="number"
              step="0.01"
              value={value.split(',')[0] || ''}
              onChange={(e) => {
                const [, max] = (value || ',').split(',');
                handleAttributeChange(attr.slug, `${e.target.value},${max || ''}`);
              }}
              placeholder="Від"
              className="cms-range-input"
            />
            <input
              type="number"
              step="0.01"
              value={value.split(',')[1] || ''}
              onChange={(e) => {
                const [min] = (value || ',').split(',');
                handleAttributeChange(attr.slug, `${min || ''},${e.target.value}`);
              }}
              placeholder="До"
              className="cms-range-input"
            />
          </div>
        );

      default:
        return null;
    }
  };

  const uploadImages = async () => {
    if (imageFiles.length === 0) return [];
    
    const uploadedUrls = [];
    
    for (const file of imageFiles) {
      const formData = new FormData();
      formData.append('image', file);
      
      try {
        const uploadRes = await fetch('http://localhost:3001/api/products/upload', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });
        
        if (!uploadRes.ok) {
          throw new Error('Image upload failed');
        }
        
        const uploadData = await uploadRes.json();
        uploadedUrls.push(uploadData.url);
      } catch (err) {
        console.error("Error uploading image:", err);
        throw new Error(`Failed to upload image: ${file.name}`);
      }
    }
    
    return uploadedUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setError('');
    
    try {
      // Перевіряємо обов'язкові атрибути
      const requiredAttributes = categoryAttributes.filter(ca => ca.isRequired);
      for (const reqAttr of requiredAttributes) {
        if (!attributeValues[reqAttr.attribute.slug]) {
          throw new Error(`Поле "${reqAttr.attribute.name}" є обов'язковим`);
        }
      }

      // Завантажуємо всі зображення
      let imageUrls = [];
      if (imageFiles.length > 0) {
        imageUrls = await uploadImages();
        
        // Переставляємо головне зображення на перше місце
        if (mainImageIndex > 0 && mainImageIndex < imageUrls.length) {
          const mainImage = imageUrls[mainImageIndex];
          imageUrls.splice(mainImageIndex, 1);
          imageUrls.unshift(mainImage);
        }
      }
      
      const productData = {
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        images: imageUrls, // ВИКОРИСТОВУЄМО МНОЖИННІ ЗОБРАЖЕННЯ
        categoryId: parseInt(categoryId),
        attributes: attributeValues,
        // НОВІ ПОЛЯ
        mileage: mileage.trim() || null,
        transmission: transmission.trim() || null,
        wheelbase: wheelbase.trim() || null,
        fuelType: fuelType.trim() || null
      };
      
      const productRes = await fetch('http://localhost:3001/api/products', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      
      const productResult = await productRes.json();
      
      if (productRes.ok) {
        alert('Product added successfully!');
        // Очищаємо форму
        setTitle('');
        setDescription('');
        setPrice('');
        setCategoryId('');
        setAttributeValues({});
        setMileage('');
        setTransmission('');
        setWheelbase('');
        setFuelType('');
        
        // Очищаємо зображення
        imagePreviews.forEach(url => URL.revokeObjectURL(url));
        setImageFiles([]);
        setImagePreviews([]);
        setMainImageIndex(0);
        
        const fileInput = document.getElementById('productImages');
        if (fileInput) fileInput.value = '';
      } else {
        throw new Error(productResult.error || 'Failed to add product');
      }
    } catch (err) {
      console.error("Error adding product:", err);
      setError(err.message || 'Error adding product');
    } finally {
      setLoading(false);
    }
  };

  const flatCategories = flattenCategories(categories);

  return (
    <div className="product-manager">
      <h2>Add New Product</h2>
      
      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-group title-field">
          <label>Product Title:</label>
          <input
            type="text"
            placeholder="Product title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group category-field">
          <label>Category:</label>
          <select 
            value={categoryId} 
            onChange={e => setCategoryId(e.target.value)}
            required
          >
            <option value="">Select category</option>
            {flatCategories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {'-'.repeat(cat.level)} {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* НОВА СЕКЦІЯ - ШВИДКІ ХАРАКТЕРИСТИКИ */}
        <div className="quick-specs-section">
          <h3>Швидкі характеристики</h3>
          <div className="quick-specs-grid">
            <div className="form-group">
              <label>Пробіг:</label>
              <input
                type="text"
                value={mileage}
                onChange={e => setMileage(e.target.value)}
                placeholder="напр: 127 тис. км"
              />
            </div>
            
            <div className="form-group">
              <label>Коробка передач:</label>
              <select
                value={transmission}
                onChange={e => setTransmission(e.target.value)}
              >
                <option value="">Оберіть тип</option>
                <option value="Автомат">Автомат</option>
                <option value="Механіка">Механіка</option>
                <option value="Робот">Робот</option>
                <option value="Варіатор">Варіатор</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Колісна база:</label>
              <input
                type="text"
                value={wheelbase}
                onChange={e => setWheelbase(e.target.value)}
                placeholder="напр: 4x2, 6x4"
              />
            </div>
            
            <div className="form-group">
              <label>Тип палива:</label>
              <select
                value={fuelType}
                onChange={e => setFuelType(e.target.value)}
              >
                <option value="">Оберіть тип</option>
                <option value="Дизель">Дизель</option>
                <option value="Бензин">Бензин</option>
                <option value="Газ">Газ</option>
                <option value="Електро">Електро</option>
                <option value="Гібрид">Гібрид</option>
              </select>
            </div>
          </div>
        </div>

        {/* Динамічні атрибути */}
        {categoryAttributes.length > 0 && (
          <div className="attributes-section">
            <h3>Product Attributes</h3>
            
            {categoryAttributes.map(categoryAttribute => (
              <div key={categoryAttribute.id} className="form-group attribute-field">
                <label>
                  {categoryAttribute.attribute.name}
                  {categoryAttribute.isRequired && (
                    <span className="required-mark">*</span>
                  )}
                  {categoryAttribute.attribute.unit && (
                    <span className="unit-label">({categoryAttribute.attribute.unit})</span>
                  )}
                </label>
                {renderAttributeInput(categoryAttribute)}
              </div>
            ))}
          </div>
        )}
        
        <div className="form-group description-field">
          <label>Description:</label>
          <textarea
            placeholder="Product description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group price-field">
          <label>Price ($):</label>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={price}
            onChange={e => setPrice(e.target.value)}
            required
          />
        </div>
        
        {/* НОВА СЕКЦІЯ - МНОЖИННІ ЗОБРАЖЕННЯ */}
        <div className="images-section">
          <h3>Зображення товару</h3>
          
          <div className="form-group image-upload file-input-field">
            <label>Додати зображення:</label>
            <div className="file-input-container">
              <input
                type="file"
                id="productImages"
                accept="image/*"
                multiple
                onChange={handleMultipleFileChange}
                className="file-input"
              />
              <label htmlFor="productImages" className="file-input-label">
                <span className="upload-icon">📷</span>
                <span>Оберіть зображення (можна декілька)</span>
              </label>
            </div>
          </div>
          
          {/* Галерея завантажених зображень */}
          {imagePreviews.length > 0 && (
            <div className="images-gallery">
              <h4>Завантажені зображення:</h4>
              <div className="images-grid">
                {imagePreviews.map((preview, index) => (
                  <div 
                    key={index} 
                    className={`image-item ${mainImageIndex === index ? 'main' : ''}`}
                  >
                    <img src={preview} alt={`Preview ${index + 1}`} className="image-preview" />
                    
                    {/* Кнопка видалення */}
                    <button 
                      type="button" 
                      className="remove-image-btn"
                      onClick={() => removeImage(index)}
                      title="Видалити зображення"
                    >
                      🗑️
                    </button>
                    
                    {/* Кнопка встановлення головного зображення */}
                    <button
                      type="button"
                      className={`main-image-btn ${mainImageIndex === index ? 'active' : ''}`}
                      onClick={() => setMainImage(index)}
                      title={mainImageIndex === index ? 'Головне зображення' : 'Зробити головним'}
                    >
                      {mainImageIndex === index ? '★' : '☆'}
                    </button>
                    
                    {/* Позначка головного зображення */}
                    {mainImageIndex === index && (
                      <div className="main-image-badge">ГОЛОВНЕ</div>
                    )}
                  </div>
                ))}
              </div>
              <p className="images-hint">
                ★ Головне зображення буде показано першим. Клікніть на ☆ щоб змінити головне зображення.
              </p>
            </div>
          )}
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <button type="submit" className="add-btn" disabled={loading}>
          {loading ? 'Adding Product...' : 'Add Product'}
        </button>
      </form>
    </div>
  );
}