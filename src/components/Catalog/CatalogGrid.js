// CatalogGrid.js

import React from 'react';
import Item from '../MainPage/item'; // Використовуємо існуючий компонент
import './CatalogGrid.css';

const CatalogGrid = ({ products, loading, error, onShowItem }) => {
  
  if (loading) {
    return (
      <div className="catalog-grid-container">
        <div className="catalog-loading">
          <div className="loading-spinner"></div>
          <div className="loading-content">
            <h3>Завантаження товарів...</h3>
            <p>Зачекайте, будь ласка</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="catalog-grid-container">
        <div className="catalog-error">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          <h3>Помилка завантаження</h3>
          <p>{error}</p>
          <button 
            className="retry-btn"
            onClick={() => window.location.reload()}
          >
            Спробувати знову
          </button>
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="catalog-grid-container">
        <div className="catalog-empty">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <h3>Товарів не знайдено</h3>
          <p>Спробуйте змінити параметри пошуку або фільтри</p>
        </div>
      </div>
    );
  }

  return (
    <div className="catalog-grid-container">
      <div className="catalog-grid">
        {products.map(product => (
          <Item
            key={product.id}
            item={product}
            onShowItem={onShowItem}
            onAdd={() => {}} // Поки що порожня функція для додавання в кошик
          />
        ))}
      </div>
    </div>
  );
};

export default CatalogGrid;