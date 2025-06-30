// CatalogFilters.js

import React, { useState, useEffect, useCallback } from 'react';
import PriceFilter from './PriceFilter';
import AttributeFilter from './AttributeFilter';
import './CatalogFilters.css';

const CatalogFilters = ({ categoryId, availableFilters, onFiltersChange }) => {
  const [filters, setFilters] = useState({});
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Завжди завантажуємо фільтри, навіть якщо категорія не вибрана
    fetchFilters(categoryId);
  }, [categoryId]);

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const [availableFiltersState, setAvailableFilters] = useState([]);

  const fetchFilters = async (catId) => {
    setLoading(true);
    try {
      // Якщо категорія не вибрана, завантажуємо всі фільтри
      const endpoint = catId 
        ? `http://localhost:3001/api/products/filters/${catId}`
        : 'http://localhost:3001/api/products/filters';
        
      const res = await fetch(endpoint, {
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        setAvailableFilters(data.filters || []);
      }
    } catch (err) {
      console.error('Error fetching filters:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = useCallback((filterKey, value) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      if (value === '' || value === null || value === undefined) {
        delete newFilters[filterKey];
      } else {
        newFilters[filterKey] = value;
      }
      
      return newFilters;
    });
  }, []);

  const handlePriceChange = useCallback((field, value) => {
    setPriceRange(prev => {
      const newRange = { ...prev, [field]: value };
      
      setFilters(prevFilters => {
        const newFilters = { ...prevFilters };
        if (newRange.min) newFilters.price_min = newRange.min;
        else delete newFilters.price_min;
        
        if (newRange.max) newFilters.price_max = newRange.max;
        else delete newFilters.price_max;
        
        return newFilters;
      });
      
      return newRange;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({});
    setPriceRange({ min: '', max: '' });
  }, []);

  const activeFiltersCount = Object.keys(filters).length;
  const currentFilters = availableFilters || availableFiltersState;

  return (
    <div className="catalog-filters">
      <div className="filters-header">
        <h3 className="filters-title">
          Фільтри
          {activeFiltersCount > 0 && (
            <span className="filters-count-badge">
              {activeFiltersCount}
            </span>
          )}
        </h3>
        
        {activeFiltersCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="clear-filters-btn"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            Очистити
          </button>
        )}
      </div>

      {loading ? (
        <div className="filters-loading">
          <div className="loading-spinner"></div>
          <span>Завантаження фільтрів...</span>
        </div>
      ) : (
        <div className="filters-content">
          {/* Фільтр ціни */}
          <PriceFilter
            priceRange={priceRange}
            onPriceChange={handlePriceChange}
          />

          {/* Атрибутні фільтри */}
          {currentFilters.length > 0 ? (
            <div className="attribute-filters">
              {currentFilters
                .sort((a, b) => {
                  const aDisplayOrder = a.attribute.displayOrder || 0;
                  const bDisplayOrder = b.attribute.displayOrder || 0;
                  
                  if (aDisplayOrder === bDisplayOrder) {
                    return (a.displayOrder || 0) - (b.displayOrder || 0);
                  }
                  
                  return aDisplayOrder - bDisplayOrder;
                })
                .map(filterData => (
                  <AttributeFilter
                    key={filterData.attribute.id}
                    filterData={filterData}
                    currentFilters={filters}
                    onFilterChange={handleFilterChange}
                  />
                ))}
            </div>
          ) : (
            !loading && (
              <div className="filters-empty-state">
                {categoryId ? (
                  <>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <p>Для цієї категорії немає додаткових фільтрів</p>
                  </>
                ) : (
                  <>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                    </svg>
                    <p>Оберіть категорію для відображення фільтрів</p>
                  </>
                )}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default CatalogFilters;