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
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
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
      
      // Очищаємо попередні значення атрибутів
      setAttributeValues({});
    } catch (err) {
      console.error("Error fetching category attributes:", err);
      setCategoryAttributes([]);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreview(null);
    const fileInput = document.getElementById('productImage');
    if (fileInput) fileInput.value = '';
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
              className="range-input"
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
              className="range-input"
            />
          </div>
        );

      default:
        return null;
    }
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

      let imageUrl = null;
      
      if (image) {
        const formData = new FormData();
        formData.append('image', image);
        
        const uploadRes = await fetch('http://localhost:3001/api/products/upload', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });
        
        if (!uploadRes.ok) {
          throw new Error('Image upload failed');
        }
        
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      }
      
      const productData = {
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        image: imageUrl,
        categoryId: parseInt(categoryId),
        attributes: attributeValues
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
        setImage(null);
        setPreview(null);
        const fileInput = document.getElementById('productImage');
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
        
        <div className="form-group image-upload file-input-field">
          <label>Product Image:</label>
          <div className="file-input-container">
            <input
              type="file"
              id="productImage"
              accept="image/*"
              onChange={handleFileChange}
              className="file-input"
            />
            <label htmlFor="productImage" className="file-input-label">
              <span className="upload-icon">📷</span>
              <span>Choose an image</span>
            </label>
          </div>
        </div>
        
        {preview && (
          <div className="image-preview-container">
            <div className="image-preview">
              <img src={preview} alt="Product preview" />
              <button 
                type="button" 
                className="remove-image-btn"
                onClick={handleRemoveImage}
              >
                🗑️
              </button>
            </div>
          </div>
        )}
        
        {error && <div className="error-message">{error}</div>}
        
        <button type="submit" className="add-btn" disabled={loading}>
          {loading ? 'Adding Product...' : 'Add Product'}
        </button>
      </form>
    </div>
  );
}