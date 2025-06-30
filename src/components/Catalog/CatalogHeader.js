// CatalogHeader.js

import React from 'react';
import './CatalogHeader.css';

const CatalogHeader = ({
  categories,
  selectedCategoryId,
  onCategoryChange,
  totalProducts,
  sortBy,
  sortOrder,
  onSortChange,
  limit,
  onLimitChange
}) => {
  
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

  const getCurrentCategoryName = () => {
    if (!selectedCategoryId) return 'Всі товари';
    const category = flatCategories.find(cat => cat.id.toString() === selectedCategoryId.toString());
    return category ? category.name : 'Каталог товарів';
  };

  return (
    <header className="catalog-header">
      <div className="catalog-header-top">
        <div className="catalog-title-section">
          <h1 className="catalog-title">
            {getCurrentCategoryName()}
          </h1>
          <p className="catalog-subtitle">
            {totalProducts > 0 ? `Знайдено ${totalProducts} товарів` : 'Товарів не знайдено'}
          </p>
        </div>

        {/* Селектор категорії */}
        <div className="category-selector">
          <label htmlFor="category-select" className="category-label">
            Категорія:
          </label>
          <select
            id="category-select"
            value={selectedCategoryId}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="category-select"
          >
            <option value="">Всі категорії</option>
            {flatCategories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {'-'.repeat(cat.level)} {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="catalog-header-controls">
        {/* Сортування */}
        <div className="sort-controls">
          <label htmlFor="sort-select" className="sort-label">
            Сортувати:
          </label>
          <select
            id="sort-select"
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split('-');
              onSortChange(newSortBy, newSortOrder);
            }}
            className="sort-select"
          >
            <option value="createdAt-desc">Новіші спочатку</option>
            <option value="createdAt-asc">Старіші спочатку</option>
            <option value="price-asc">Ціна: від дешевих</option>
            <option value="price-desc">Ціна: від дорогих</option>
            <option value="title-asc">Назва: А-Я</option>
            <option value="title-desc">Назва: Я-А</option>
            <option value="viewCount-desc">За популярністю</option>
          </select>
        </div>

        {/* Кількість товарів на сторінку */}
        <div className="limit-controls">
          <label htmlFor="limit-select" className="limit-label">
            Показувати:
          </label>
          <select
            id="limit-select"
            value={limit}
            onChange={(e) => onLimitChange(parseInt(e.target.value))}
            className="limit-select"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="limit-text">товарів</span>
        </div>

        {/* View Toggle (в майбутньому можна додати перемикач вигляду) */}
        <div className="view-controls">
          <button 
            className="view-btn view-btn-grid active"
            title="Сітка"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default CatalogHeader;