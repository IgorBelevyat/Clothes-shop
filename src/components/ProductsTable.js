import React, { useState, useEffect } from 'react';
import './ProductsTable.css';
import FilterComponent from './FilterComponent'; 

export default function ProductsTable() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [tempProduct, setTempProduct] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  

  const [activeFilters, setActiveFilters] = useState({
    title: '',
    description: '',
    price: '',
    category: ''
  });
  
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);
  
  
  useEffect(() => {
    
    const applyFilters = () => {
      let filtered = [...products];
      
      
      if (activeFilters.title) {
        filtered = filtered.filter(product => 
          product.title.toLowerCase().includes(activeFilters.title.toLowerCase())
        );
      }
      
      
      if (activeFilters.description) {
        filtered = filtered.filter(product => 
          product.description.toLowerCase().includes(activeFilters.description.toLowerCase())
        );
      }
      
      
      if (activeFilters.price) {
        const maxPrice = parseFloat(activeFilters.price);
        filtered = filtered.filter(product => product.price <= maxPrice);
      }
      
     
      if (activeFilters.category) {
        filtered = filtered.filter(product => product.categoryId === parseInt(activeFilters.category));
      }
      
      setFilteredProducts(filtered);
    };

    applyFilters();
  }, [products, activeFilters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/products', {
        credentials: 'include'
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await res.json();
      setProducts(data);
      setFilteredProducts(data); 
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

  
  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
  };
  
  
  const resetFilters = () => {
    setActiveFilters({
      title: '',
      description: '',
      price: '',
      category: ''
    });
    setFilteredProducts(products);
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

  const startEditing = (product) => {
    setEditingProduct(product.id);
    setTempProduct({ ...product });
    setImagePreview(product.image);
  };

  const cancelEditing = () => {
    setEditingProduct(null);
    setTempProduct({});
    setImageFile(null);
    setImagePreview(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempProduct(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) : 
              name === 'categoryId' ? parseInt(value) : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return null;
    
    const formData = new FormData();
    formData.append('image', imageFile);
    
    try {
      const res = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      if (!res.ok) {
        throw new Error('Image upload failed');
      }
      
      const data = await res.json();
      return data.url;
    } catch (err) {
      console.error("Error uploading image:", err);
      alert('Failed to upload image');
      return null;
    }
  };

  const saveProduct = async () => {
    try {
      let imageUrl = tempProduct.image;
      
      
      if (imageFile) {
        const newImageUrl = await uploadImage();
        if (newImageUrl) {
          imageUrl = newImageUrl;
        } else {
          return;
        }
      }
      
      const updatedProduct = {
        ...tempProduct,
        image: imageUrl
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
      
      
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p.id === tempProduct.id ? { ...updatedProduct } : p
        )
      );
      
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
      
      
      setProducts(products.filter(p => p.id !== productId));
      
    } catch (err) {
      console.error("Error deleting product:", err);
      alert(err.message || 'Failed to delete product');
    }
  };

  const getCategoryName = (categoryId) => {
    const category = flatCategories.find(c => c.id === categoryId);
    return category ? category.name : 'Uncategorized';
  };

  return (
    <div className="products-table-container">
      <h3>Manage Products</h3>
      
      
      <div className="filters-section">
        <h4>Filters</h4>
        <FilterComponent 
          filters={{ title: true, description: true, category: true, price: true }}
          onFilterChange={handleFilterChange}
        />
        <button 
          className="reset-filters-btn" 
          onClick={resetFilters}
        >
          Clean filters
        </button>
        {filteredProducts.length > 0 && products.length !== filteredProducts.length && (
          <div className="filter-status">
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'} out of {products.length}
          </div>
        )}
      </div>
      
      {loading ? (
        <div className="loading">Loading products...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <table className="products-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Description</th>
              <th>Price</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-products">
                  {products.length === 0 ? 'No products found' : 'Нет товаров, соответствующих фильтрам'}
                </td>
              </tr>
            ) : (
              filteredProducts.map(product => (
                <tr key={product.id} className={editingProduct === product.id ? 'editing' : ''}>
                  <td className="product-image-cell">
                    {editingProduct === product.id ? (
                      <div className="image-upload">
                        <img 
                          src={imagePreview || product.image} 
                          alt={tempProduct.title} 
                          className="product-image-preview" 
                        />
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleFileChange} 
                          className="image-input"
                        />
                      </div>
                    ) : (
                      <img 
                        src={product.image} 
                        alt={product.title} 
                        className="product-image" 
                      />
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
                      `$${product.price.toFixed(2)}`
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
      )}
    </div>
  );
}