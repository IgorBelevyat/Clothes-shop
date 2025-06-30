// PriceFilter.js

import React from 'react';
import './PriceFilter.css';

const PriceFilter = ({ priceRange, onPriceChange }) => {
  return (
    <div className="price-filter">
      <h4 className="filter-section-title">
        <svg className="filter-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
        Ціна ($)
      </h4>
      
      <div className="price-inputs">
        <div className="price-input-group">
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Від"
            value={priceRange.min}
            onChange={(e) => onPriceChange('min', e.target.value)}
            className="price-input"
          />
          <span className="price-label">від</span>
        </div>
        
        <div className="price-separator">—</div>
        
        <div className="price-input-group">
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="До"
            value={priceRange.max}
            onChange={(e) => onPriceChange('max', e.target.value)}
            className="price-input"
          />
          <span className="price-label">до</span>
        </div>
      </div>
      
      {(priceRange.min || priceRange.max) && (
        <div className="price-display">
          {priceRange.min && priceRange.max ? (
            <span className="price-range-text">
              ${priceRange.min} — ${priceRange.max}
            </span>
          ) : priceRange.min ? (
            <span className="price-range-text">
              від ${priceRange.min}
            </span>
          ) : (
            <span className="price-range-text">
              до ${priceRange.max}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default PriceFilter;