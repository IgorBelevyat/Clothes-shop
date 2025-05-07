import React from 'react';


function Categories({ categories, chooseCategory }) {
  const renderCategoryItems = (categories, level = 0) => {
    return categories.map(category => (
      <div key={category.id} className="category-container">
        <div 
          className="category-item" 
          style={{ paddingLeft: `${level * 10}px` }}
          onClick={() => chooseCategory(category.name)}
        >
          <span className="category-icon">
            {category.children && category.children.length > 0 ? '📁' : '📄'}
          </span>
          <span className="category-label">{category.name}</span>
        </div>
        
        {category.children && category.children.length > 0 && (
          <div className="subcategories">
            {renderCategoryItems(category.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="categories">
      <div className="category-header">Categories</div>
      <div 
        className="category-item all-categories" 
        onClick={() => chooseCategory('all')}
      >
        <span className="category-icon">🏠</span>
        <span className="category-label">All categories</span>
      </div>
      
      {renderCategoryItems(categories)}
    </div>
  );
}

export default Categories;