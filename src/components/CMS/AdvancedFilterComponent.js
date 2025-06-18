import React, { useState, useEffect, useCallback } from 'react';
import './AdvancedFilterComponent.css';

export default function DependentFilterComponent({ categoryId, onFiltersChange }) {
  const [filters, setFilters] = useState({});
  const [availableFilters, setAvailableFilters] = useState([]);
  const [dependentValues, setDependentValues] = useState({});
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (categoryId) {
      fetchAvailableFilters(categoryId);
    } else {
      setAvailableFilters([]);
      setFilters({});
      setDependentValues({});
    }
  }, [categoryId]);

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters]);

  const fetchAvailableFilters = async (catId) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/api/products/filters/${catId}`, {
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log('Отримані фільтри:', data);
        setAvailableFilters(data);
        setDependentValues({});
        setFilters({});
      }
    } catch (err) {
      console.error('Error fetching filters:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDependentValues = async (attributeSlug, parentValueId) => {
    try {
      const res = await fetch(`http://localhost:3001/api/attributes/dependent/${attributeSlug}/parent/${parentValueId}`, {
        credentials: 'include'
      });
      
      if (res.ok) {
        const values = await res.json();
        setDependentValues(prev => ({
          ...prev,
          [attributeSlug]: values
        }));
      }
    } catch (err) {
      console.error('Error fetching dependent values:', err);
    }
  };

  const handleFilterChange = useCallback((attributeSlug, value, type = 'attr') => {
    const filterKey = type === 'range' ? `range_${attributeSlug}` : `attr_${attributeSlug}`;
    
    setFilters(prev => {
      const newFilters = { ...prev };
      
      if (value === '' || value === null || value === undefined) {
        delete newFilters[filterKey];
      } else {
        newFilters[filterKey] = value;
      }

      const parentFilter = availableFilters.find(f => f.attribute.slug === attributeSlug);
      if (parentFilter) {
        const dependentFilters = availableFilters.filter(f => 
          f.attribute.dependsOn === parentFilter.attribute.id
        );
        
        dependentFilters.forEach(depFilter => {
          const depFilterKey = `attr_${depFilter.attribute.slug}`;
          delete newFilters[depFilterKey];
        });

        if (value && dependentFilters.length > 0) {
          dependentFilters.forEach(depFilter => {
            fetchDependentValues(depFilter.attribute.slug, value);
          });
        }
      }
      
      return newFilters;
    });
  }, [availableFilters]);

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
    setDependentValues({});
  }, []);

  const getAttributeValues = (attr) => {
    if (attr.dependsOn && dependentValues[attr.slug]) {
      return dependentValues[attr.slug];
    }
    return attr.attributeValues || [];
  };

  const isAttributeDisabled = (attr) => {
    if (attr.dependsOn) {
      const parentAttribute = availableFilters.find(f => f.attribute.id === attr.dependsOn);
      if (parentAttribute) {
        const parentFilterKey = `attr_${parentAttribute.attribute.slug}`;
        return !filters[parentFilterKey];
      }
    }
    return false;
  };

  const renderFilter = (filterData) => {
    const attr = filterData.attribute;
    const isDisabled = isAttributeDisabled(attr);
    const attributeValues = getAttributeValues(attr);
    
    switch (attr.type) {
      case 'SELECT':
        return (
          <div key={attr.id} className="attribute-filter">
            <label className={`attribute-label ${isDisabled ? 'disabled' : ''}`}>
              {attr.name}:
              {attr.dependsOn && (
                <span className="dependency-hint">
                  (залежить від {availableFilters.find(f => f.attribute.id === attr.dependsOn)?.attribute.name})
                </span>
              )}
            </label>
            <select
              disabled={isDisabled}
              value={filters[`attr_${attr.slug}`] || ''}
              onChange={(e) => handleFilterChange(attr.slug, e.target.value)}
              className="attribute-select"
            >
              <option value="">Всі {attr.name.toLowerCase()}</option>
              {attributeValues.map(value => (
                <option key={value.id} value={value.id}>
                  {value.displayName || value.value} ({value.count || 0})
                </option>
              ))}
            </select>
          </div>
        );

      case 'NUMBER':
      case 'RANGE':
        if (attr.minValue === null || attr.minValue === undefined || 
            attr.maxValue === null || attr.maxValue === undefined) {
          console.log(`Атрибут ${attr.name} не має min/max значень:`, attr.minValue, attr.maxValue);
          return null;
        }
        
        return (
          <div key={attr.id} className="attribute-filter">
            <label className="attribute-label">
              {attr.name}
              {attr.unit && <span style={{ color: '#666' }}> ({attr.unit})</span>}:
            </label>
            <div className="range-filter-inputs">
              <input
                type="number"
                placeholder={`від ${attr.minValue}`}
                value={filters[`range_${attr.slug}`]?.split(',')[0] || ''}
                onChange={(e) => {
                  const currentValue = filters[`range_${attr.slug}`] || ',';
                  const [, max] = currentValue.split(',');
                  handleFilterChange(attr.slug, `${e.target.value},${max || ''}`, 'range');
                }}
                className="range-input"
              />
              <span className="range-separator">—</span>
              <input
                type="number"
                placeholder={`до ${attr.maxValue}`}
                value={filters[`range_${attr.slug}`]?.split(',')[1] || ''}
                onChange={(e) => {
                  const currentValue = filters[`range_${attr.slug}`] || ',';
                  const [min] = currentValue.split(',');
                  handleFilterChange(attr.slug, `${min || ''},${e.target.value}`, 'range');
                }}
                className="range-input"
              />
            </div>
            <div className="range-hint">
              Доступний діапазон: {attr.minValue} — {attr.maxValue}
            </div>
          </div>
        );

      case 'BOOLEAN':
        return (
          <div key={attr.id} className="attribute-filter">
            <label className="boolean-filter">
              <input
                type="checkbox"
                checked={filters[`attr_${attr.slug}`] === 'true'}
                onChange={(e) => handleFilterChange(attr.slug, e.target.checked ? 'true' : '')}
                className="boolean-checkbox"
              />
              {attr.name}
            </label>
          </div>
        );

      case 'TEXT':
        return (
          <div key={attr.id} className="attribute-filter">
            <label className="attribute-label">
              {attr.name}:
            </label>
            <input
              type="text"
              placeholder={`Пошук за ${attr.name.toLowerCase()}`}
              value={filters[`attr_${attr.slug}`] || ''}
              onChange={(e) => handleFilterChange(attr.slug, e.target.value)}
              className="attribute-input"
            />
          </div>
        );

      default:
        return null;
    }
  };

  const activeFiltersCount = Object.keys(filters).length;

  return (
    <div className="filters-container">
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
            Очистити все
          </button>
        )}
      </div>

      {loading ? (
        <div className="filters-loading">
          Завантаження фільтрів...
        </div>
      ) : (
        <>
          <div className="price-filter-section">
            <label className="price-filter-label">
              Ціна ($):
            </label>
            <div className="price-filter-inputs">
              <input
                type="number"
                step="0.01"
                placeholder="від"
                value={priceRange.min}
                onChange={(e) => handlePriceChange('min', e.target.value)}
                className="price-input"
              />
              <span className="price-separator">—</span>
              <input
                type="number"
                step="0.01"
                placeholder="до"
                value={priceRange.max}
                onChange={(e) => handlePriceChange('max', e.target.value)}
                className="price-input"
              />
            </div>
          </div>

          {availableFilters.length > 0 ? (
            <div className="filters-grid">
              {availableFilters
                .sort((a, b) => {
                  const aDisplayOrder = a.attribute.displayOrder || 0;
                  const bDisplayOrder = b.attribute.displayOrder || 0;
                  
                  if (aDisplayOrder === bDisplayOrder) {
                    return (a.displayOrder || 0) - (b.displayOrder || 0);
                  }
                  
                  return aDisplayOrder - bDisplayOrder;
                })
                .map(renderFilter)}
            </div>
          ) : (
            !loading && categoryId && (
              <div className="filters-empty-state">
                Для цієї категорії немає додаткових фільтрів
              </div>
            )
          )}

          {!categoryId && !loading && (
            <div className="filters-empty-state">
              Оберіть категорію для відображення фільтрів
            </div>
          )}
        </>
      )}
    </div>
  );
}