import React, { useState, useEffect } from 'react';
import './CategoryManager.css';

export default function CategoryManager() {
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [categories, setCategories] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [attachedProducts, setAttachedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(null);
  const [editName, setEditName] = useState('');
  const [moveMode, setMoveMode] = useState(null);
  const [moveParentId, setMoveParentId] = useState('');
  

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/api/categories', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, parentId: parentId || null })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to add category');
      }

      await res.json(); 
      alert('Category added successfully!');
      setName('');
      setParentId('');
      fetchCategories();
    } catch (err) {
      console.error("Error adding category:", err);
      alert(err.message || 'Error adding category');
    }
  };


  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:3001/api/categories/${editMode}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to rename category');
      }

      await res.json();
      alert('Category renamed successfully!');
      cancelEdit();
      fetchCategories();
    } catch (err) {
      console.error("Error renaming category:", err);
      alert(err.message || 'Error renaming category');
    }
  };


  const handleMoveSubmit = async (e) => {
    e.preventDefault();
    
    try {

      const finalParentId = moveParentId === '' ? null : moveParentId;
      

      const res = await fetch(`http://localhost:3001/api/categories/${moveMode}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          parentId: finalParentId
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to move category');
      }

      await res.json();
      alert('Category moved successfully!');
      cancelMove();
      fetchCategories();
    } catch (err) {
      console.error("Error moving category:", err);
      alert(err.message || 'Error moving category');
    }
  };

  const handleDeleteClick = async (categoryId) => {
    setDeleteError('');
    setAttachedProducts([]);
    
    try {

      const hasSubcategories = checkForSubcategories(categoryId, categories);
      
      if (hasSubcategories) {
        setDeleteError('Cannot delete category with subcategories. Please delete all subcategories first.');
        setDeleteConfirm(categoryId);
        return;
      }
      

      const res = await fetch(`http://localhost:3001/api/categories/${categoryId}/products`, {
        credentials: 'include'
      });
      
      if (!res.ok) {
        throw new Error('Failed to check products');
      }
      
      const products = await res.json();
      
      if (products.length > 0) {
        setAttachedProducts(products);
        setDeleteConfirm(categoryId);
      } else {
        confirmDelete(categoryId);
      }
    } catch (err) {
      console.error("Error checking category:", err);
      alert('Error checking category for deletion');
    }
  };


  const checkForSubcategories = (categoryId, categoryList) => {
    for (const category of categoryList) {
      if (category.id === categoryId) {
        return category.children && category.children.length > 0;
      }
      
      if (category.children && category.children.length > 0) {
        const hasSubcats = checkForSubcategories(categoryId, category.children);
        if (hasSubcats) return true;
      }
    }
    return false;
  };

  const confirmDelete = async (categoryId) => {
    try {
      const res = await fetch(`http://localhost:3001/api/categories/${categoryId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete category');
      }

      await res.json();
      alert('Category successfully deleted');
      fetchCategories();
    } catch (err) {
      console.error("Error deleting category:", err);
      setDeleteError(err.message || 'Error deleting category');
    } finally {
      setDeleteConfirm(null);
      setAttachedProducts([]);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
    setAttachedProducts([]);
    setDeleteError('');
  };


  const handleEditClick = (categoryId, categoryName) => {
    setEditMode(categoryId);
    setEditName(categoryName);

    cancelMove();
  };


  const cancelEdit = () => {
    setEditMode(null);
    setEditName('');
  };


  const handleMoveClick = (categoryId, currentParentId) => {
    setMoveMode(categoryId);
    setMoveParentId(currentParentId || '');

    cancelEdit();
  };


  const cancelMove = () => {
    setMoveMode(null);
    setMoveParentId('');
  };


  const getCategoryPath = (categoryId, categoryList) => {
    const findPath = (id, categories, path = []) => {
      for (const category of categories) {
        if (category.id === id) {
          return [...path, category];
        }
        
        if (category.children && category.children.length > 0) {
          const result = findPath(id, category.children, [...path, category]);
          if (result.length) return result;
        }
      }
      
      return [];
    };
    
    return findPath(categoryId, categoryList);
  };


  const getCategoryParentId = (categoryId, categoryList, parentId = null) => {
    for (const category of categoryList) {
      if (category.id === categoryId) {
        return parentId;
      }
      
      if (category.children && category.children.length > 0) {
        const foundParentId = getCategoryParentId(categoryId, category.children, category.id);
        if (foundParentId !== null) {
          return foundParentId;
        }
      }
    }
    
    return null;
  };


  const flattenCategories = (categories, level = 0, result = [], excludeId = null) => {
    if (!categories) return result;
    

    let excludePath = [];
    if (excludeId) {
      excludePath = getCategoryPath(excludeId, categories).map(cat => cat.id);
    }
    
    categories.forEach(category => {
      if (!excludePath.includes(category.id)) {
        result.push({
          id: category.id,
          name: category.name,
          level: level
        });
        
        if (category.children && category.children.length > 0) {
          flattenCategories(category.children, level + 1, result, excludeId);
        }
      }
    });
    
    return result;
  };

  const renderCategoryTree = (categories, level = 0) => {
    if (!categories || categories.length === 0) {
      return null;
    }

    return (
      <div className="category-level" style={{ marginLeft: level * 20 }}>
        {categories.map(category => (
          <div key={category.id} className="category-item">
            {editMode === category.id ? (
              <form onSubmit={handleEditSubmit} className="category-edit-form">
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  autoFocus
                  required
                />
                <div className="edit-buttons">
                  <button type="submit" className="save-btn" title="Save">💾</button>
                  <button type="button" onClick={cancelEdit} className="cancel-btn-small" title="Cancel">❌</button>
                </div>
              </form>
            ) : moveMode === category.id ? (
              <form onSubmit={handleMoveSubmit} className="category-move-form">
                <select 
                  value={moveParentId} 
                  onChange={e => setMoveParentId(e.target.value)}
                >
                  <option value="">No parent (root category)</option>
                  {flattenCategories(categories, 0, [], category.id).map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {'-'.repeat(cat.level)} {cat.name}
                    </option>
                  ))}
                </select>
                <div className="edit-buttons">
                  <button type="submit" className="save-btn" title="Move">💾</button>
                  <button type="button" onClick={cancelMove} className="cancel-btn-small" title="Cancel">❌</button>
                </div>
              </form>
            ) : (
              <div className={`category-row ${deleteConfirm === category.id ? 'selected' : ''}`}>
                <span className="category-icon">
                  {category.children && category.children.length > 0 ? '📁' : '📁'}
                </span>
                <span className="category-name">{category.name}</span>
                <div className="category-actions">
                  <button 
                    className="action-btn edit-btn"
                    onClick={() => handleEditClick(category.id, category.name)}
                    title="Rename category"
                  >
                    ✏️
                  </button>
                  <button 
                    className="action-btn move-btn"
                    onClick={() => handleMoveClick(category.id, getCategoryParentId(category.id, categories))}
                    title="Move category"
                  >
                    🔄
                  </button>
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => handleDeleteClick(category.id)}
                    title="Delete category"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )}
            
            {category.children && category.children.length > 0 && (
              renderCategoryTree(category.children, level + 1)
            )}
          </div>
        ))}
      </div>
    );
  };

  const flatCategories = flattenCategories(categories);

  return (
    <div className="category-manager">
      <h2>Add Category / Subcategory</h2>
      
      <form onSubmit={handleSubmit} className="category-form">
        <div className="form-group">
          <label>Category Name:</label>
          <input
            type="text"
            placeholder="Category name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Parent Category:</label>
          <select 
            value={parentId} 
            onChange={e => setParentId(e.target.value)}
          >
            <option value="">No parent (root category)</option>
            {flatCategories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {'-'.repeat(cat.level)} {cat.name}
              </option>
            ))}
          </select>
        </div>
        
        <button type="submit" className="add-btn">Add Category</button>
      </form>

      <div className="category-tree-container">
        <h3>📁 Category Tree:</h3>
        
        {loading ? (
          <div className="loading">Loading...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : categories.length === 0 ? (
          <div className="no-items">No categories found. Create your first category!</div>
        ) : (
          <div className="category-tree">
            {renderCategoryTree(categories)}
          </div>
        )}
      </div>

      {deleteConfirm && (
        <div className="delete-modal">
          <div className="delete-modal-content">
            <h3>Confirm Deletion</h3>
            
            {deleteError && (
              <div className="error-message">{deleteError}</div>
            )}
            
            {attachedProducts.length > 0 && !deleteError && (
              <>
                <p>This category contains products:</p>
                <ul className="products-list">
                  {attachedProducts.map(product => (
                    <li key={product.id}>{product.title}</li>
                  ))}
                </ul>
                <p>These products will be unassigned from this category. Do you want to proceed?</p>
              </>
            )}
            
            {!deleteError && attachedProducts.length === 0 && (
              <p>Are you sure you want to delete this category?</p>
            )}
            
            <div className="modal-buttons">
              {!deleteError && (
                <button onClick={() => confirmDelete(deleteConfirm)} className="confirm-btn">
                  Yes, Delete
                </button>
              )}
              <button onClick={cancelDelete} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}