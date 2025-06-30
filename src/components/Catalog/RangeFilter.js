// RangeFilter.js

import React, { useState, useEffect, useRef } from 'react';
import './RangeFilter.css';

const RangeFilter = ({ attribute, currentValue, onFilterChange }) => {
  const [localMin, setLocalMin] = useState('');
  const [localMax, setLocalMax] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef(null);
  
  const minValue = attribute.minValue || 0;
  const maxValue = attribute.maxValue || 100;
  
  useEffect(() => {
    if (currentValue) {
      const [min, max] = currentValue.split(',');
      setLocalMin(min || '');
      setLocalMax(max || '');
    } else {
      setLocalMin('');
      setLocalMax('');
    }
  }, [currentValue]);

  const handleInputChange = (type, value) => {
    if (type === 'min') {
      setLocalMin(value);
    } else {
      setLocalMax(value);
    }
    
    const newMin = type === 'min' ? value : localMin;
    const newMax = type === 'max' ? value : localMax;
    
    // Відправляємо зміни з затримкою для кращої продуктивності
    setTimeout(() => {
      if (newMin || newMax) {
        onFilterChange(`${newMin || ''},${newMax || ''}`);
      } else {
        onFilterChange('');
      }
    }, 300);
  };

  const handleSliderChange = (type, value) => {
    const numValue = parseFloat(value);
    
    if (type === 'min') {
      setLocalMin(numValue.toString());
      const newMax = localMax || maxValue;
      if (numValue <= parseFloat(newMax)) {
        onFilterChange(`${numValue},${newMax}`);
      }
    } else {
      setLocalMax(numValue.toString());
      const newMin = localMin || minValue;
      if (numValue >= parseFloat(newMin)) {
        onFilterChange(`${newMin},${numValue}`);
      }
    }
  };

  const getSliderBackground = () => {
    const currentMin = parseFloat(localMin) || minValue;
    const currentMax = parseFloat(localMax) || maxValue;
    
    const minPercent = ((currentMin - minValue) / (maxValue - minValue)) * 100;
    const maxPercent = ((currentMax - minValue) / (maxValue - minValue)) * 100;
    
    return `linear-gradient(to right, 
      #e0e0e0 0%, 
      #e0e0e0 ${minPercent}%, 
      #2c3e50 ${minPercent}%, 
      #2c3e50 ${maxPercent}%, 
      #e0e0e0 ${maxPercent}%, 
      #e0e0e0 100%)`;
  };

  return (
    <div className="range-filter">
      {/* Діапазон з повзунками */}
      <div className="range-slider-container">
        <div className="range-slider" ref={sliderRef}>
          <div 
            className="range-track"
            style={{ background: getSliderBackground() }}
          ></div>
          
          <input
            type="range"
            min={minValue}
            max={maxValue}
            step="1"
            value={localMin || minValue}
            onChange={(e) => handleSliderChange('min', e.target.value)}
            className="range-input range-input-min"
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
          />
          
          <input
            type="range"
            min={minValue}
            max={maxValue}
            step="1"
            value={localMax || maxValue}
            onChange={(e) => handleSliderChange('max', e.target.value)}
            className="range-input range-input-max"
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
          />
        </div>
      </div>

      {/* Числові інпути */}
      <div className="range-inputs">
        <div className="range-input-group">
          <input
            type="number"
            min={minValue}
            max={maxValue}
            placeholder={minValue.toString()}
            value={localMin}
            onChange={(e) => handleInputChange('min', e.target.value)}
            className="range-number-input"
          />
          <span className="range-input-label">від</span>
        </div>
        
        <div className="range-separator">—</div>
        
        <div className="range-input-group">
          <input
            type="number"
            min={minValue}
            max={maxValue}
            placeholder={maxValue.toString()}
            value={localMax}
            onChange={(e) => handleInputChange('max', e.target.value)}
            className="range-number-input"
          />
          <span className="range-input-label">до</span>
        </div>
      </div>

      {/* Інформація про діапазон */}
      <div className="range-info">
        <span className="range-info-text">
          Доступний діапазон: {minValue} — {maxValue}
          {attribute.unit && ` ${attribute.unit}`}
        </span>
      </div>
    </div>
  );
};

export default RangeFilter;