import React, { useState, useEffect } from 'react';

function FilterComponent({ filters, onFilterChange }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');


  useEffect(() => {

    if (filters.category) {
      fetch('http://localhost:3001/api/categories', {
        credentials: 'include'
      })
        .then((response) => response.json())
        .then((data) => setCategories(data))
        .catch(err => console.error("Error fetching categories:", err));
    }
  }, [filters.category]);


  const handleChange = (field, value) => {
    if (['title', 'description', 'price', 'category'].includes(field)) {
      let newFilters = { title, description, price, category };
      switch (field) {
        case 'title':
          setTitle(value);
          newFilters.title = value;
          break;
        case 'description':
          setDescription(value);
          newFilters.description = value;
          break;
        case 'price':
          setPrice(value);
          newFilters.price = value;
          break;
        case 'category':
          setCategory(value);
          newFilters.category = value;
          break;
        default:
          break;
      }
      

      onFilterChange(newFilters);
    } else {

      let newFilters = { firstName, lastName, email, role };
      
      switch (field) {
        case 'firstName':
          setFirstName(value);
          newFilters.firstName = value;
          break;
        case 'lastName':
          setLastName(value);
          newFilters.lastName = value;
          break;
        case 'email':
          setEmail(value);
          newFilters.email = value;
          break;
        case 'role':
          setRole(value);
          newFilters.role = value;
          break;
        default:
          break;
      }
      

      onFilterChange(newFilters);
    }
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


  const roles = [
    { id: '', name: 'All roles' },
    { id: 'user', name: 'User' },
    { id: 'admin', name: 'Admin' },
    { id: 'content-manager', name: 'Content Manager' }
  ];

  return (
    <div className="filter-component">
      {/* Product Filters */}
      {filters.title && (
        <div className="filter-item">
          <input
            type="text"
            value={title}
            placeholder="Filter by name"
            onChange={(e) => handleChange('title', e.target.value)}
            className="filter-input"
          />
        </div>
      )}
      {filters.description && (
        <div className="filter-item">
          <input
            type="text"
            value={description}
            placeholder="Filter by description"
            onChange={(e) => handleChange('description', e.target.value)}
            className="filter-input"
          />
        </div>
      )}
      {filters.price && (
        <div className="filter-item">
          <input
            type="number"
            value={price}
            min="0"
            step="0.01"
            placeholder="Max price"
            onChange={(e) => handleChange('price', e.target.value)}
            className="filter-input price-filter"
          />
        </div>
      )}
      {filters.category && (
        <div className="filter-item">
          <select 
            value={category} 
            onChange={(e) => handleChange('category', e.target.value)}
            className="filter-select"
          >
            <option value="">Select category</option>
            {flatCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {'-'.repeat(cat.level)} {cat.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* User Filters */}
      {filters.firstName && (
        <div className="filter-item">
          <input
            type="text"
            value={firstName}
            placeholder="Filter by first name"
            onChange={(e) => handleChange('firstName', e.target.value)}
            className="filter-input"
          />
        </div>
      )}
      {filters.lastName && (
        <div className="filter-item">
          <input
            type="text"
            value={lastName}
            placeholder="Filter by last name"
            onChange={(e) => handleChange('lastName', e.target.value)}
            className="filter-input"
          />
        </div>
      )}
      {filters.email && (
        <div className="filter-item">
          <input
            type="text"
            value={email}
            placeholder="Filter by email"
            onChange={(e) => handleChange('email', e.target.value)}
            className="filter-input"
          />
        </div>
      )}
      {filters.role && (
        <div className="filter-item">
          <select 
            value={role} 
            onChange={(e) => handleChange('role', e.target.value)}
            className="filter-select"
          >
            {roles.map((roleOption) => (
              <option key={roleOption.id} value={roleOption.id}>
                {roleOption.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

export default FilterComponent;