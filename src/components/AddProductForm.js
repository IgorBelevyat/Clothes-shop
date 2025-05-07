import React, { useState, useEffect } from 'react';
import './AddProductForm.css';

export default function AddProductForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setError('');
    
    try {
      let imageUrl = null;
      
      if (image) {
        const formData = new FormData();
        formData.append('image', image);
        
        const uploadRes = await fetch('http://localhost:3001/api/upload', {
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
      };
      
      const productRes = await fetch('http://localhost:3001/api/products', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      
      const productData_1 = await productRes.json();
      
      if (productRes.ok) {
        alert('Product added successfully!');
        setTitle('');
        setDescription('');
        setPrice('');
        setCategoryId('');
        setImage(null);
        setPreview(null);
        const fileInput = document.getElementById('productImage');
        if (fileInput) fileInput.value = '';
      } else {
        throw new Error(productData_1.error || 'Failed to add product');
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