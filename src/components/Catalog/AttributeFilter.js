// AttributeFilter.js

import React from 'react';
import RangeFilter from './RangeFilter';
import './AttributeFilter.css';

const AttributeFilter = ({ filterData, currentFilters, onFilterChange }) => {
  const attr = filterData.attribute;
  
  const getFilterIcon = (type) => {
    switch (type) {
      case 'SELECT':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9,11 12,14 22,4"></polyline>
            <path d="M21,12v7a2,2 0,0 1,-2,2H5a2,2 0,0 1,-2,-2V5a2,2 0,0 1,2,-2h11"></path>
          </svg>
        );
      case 'RANGE':
      case 'NUMBER':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="9" x2="20" y2="9"></line>
            <line x1="4" y1="15" x2="20" y2="15"></line>
            <line x1="10" y1="3" x2="8" y2="21"></line>
            <line x1="16" y1="3" x2="14" y2="21"></line>
          </svg>
        );
      case 'BOOLEAN':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 12l2 2 4-4"></path>
            <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"></path>
          </svg>
        );
      case 'TEXT':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        );
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        );
    }
  };

  const renderFilter = () => {
    switch (attr.type) {
      case 'SELECT':
        return (
          <div className="select-filter">
            <select
              value={currentFilters[`attr_${attr.slug}`] || ''}
              onChange={(e) => onFilterChange(`attr_${attr.slug}`, e.target.value)}
              className="filter-select"
            >
              <option value="">Всі {attr.name.toLowerCase()}</option>
              {attr.attributeValues.map(value => (
                <option key={value.id} value={value.id}>
                  {value.displayName || value.value}
                  {value.count !== undefined && ` (${value.count})`}
                </option>
              ))}
            </select>
          </div>
        );

      case 'NUMBER':
      case 'RANGE':
        if (attr.minValue === null || attr.minValue === undefined || 
            attr.maxValue === null || attr.maxValue === undefined) {
          return null;
        }
        
        return (
          <RangeFilter
            attribute={attr}
            currentValue={currentFilters[`range_${attr.slug}`] || ''}
            onFilterChange={(value) => onFilterChange(`range_${attr.slug}`, value)}
          />
        );

      case 'BOOLEAN':
        return (
          <div className="boolean-filter">
            <label className="boolean-filter-label">
              <input
                type="checkbox"
                checked={currentFilters[`attr_${attr.slug}`] === 'true'}
                onChange={(e) => onFilterChange(`attr_${attr.slug}`, e.target.checked ? 'true' : '')}
                className="boolean-checkbox"
              />
              <span className="boolean-text">{attr.name}</span>
            </label>
          </div>
        );

      case 'TEXT':
        return (
          <div className="text-filter">
            <input
              type="text"
              placeholder={`Пошук за ${attr.name.toLowerCase()}`}
              value={currentFilters[`attr_${attr.slug}`] || ''}
              onChange={(e) => onFilterChange(`attr_${attr.slug}`, e.target.value)}
              className="text-input"
            />
          </div>
        );

      default:
        return null;
    }
  };

  const filterContent = renderFilter();
  if (!filterContent) return null;

  return (
    <div className="attribute-filter">
      <h4 className="filter-section-title">
        {getFilterIcon(attr.type)}
        {attr.name}
        {attr.unit && <span className="unit-label">({attr.unit})</span>}
      </h4>
      
      {filterContent}
    </div>
  );
};

export default AttributeFilter;