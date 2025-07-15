// CatalogPagination.js

import React from 'react';
import './CatalogPagination.css';

const CatalogPagination = ({ currentPage, totalPages, onPageChange }) => {
  
  const getVisiblePages = () => {
    const delta = 2; // Кількість сторінок з кожного боку від поточної
    const pages = [];
    
    // Завжди показуємо першу сторінку
    if (totalPages > 1) {
      pages.push(1);
    }
    
    // Визначаємо діапазон сторінок навколо поточної
    const startPage = Math.max(2, currentPage - delta);
    const endPage = Math.min(totalPages - 1, currentPage + delta);
    
    // Додаємо три крапки після першої сторінки, якщо потрібно
    if (startPage > 2) {
      pages.push('...');
    }
    
    // Додаємо сторінки в діапазоні
    for (let i = startPage; i <= endPage; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }
    
    // Додаємо три крапки перед останньою сторінкою, якщо потрібно
    if (endPage < totalPages - 1) {
      pages.push('...');
    }
    
    // Завжди показуємо останню сторінку
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="catalog-pagination">
      <div className="pagination-container">
        
        {/* Кнопка "Попередня" */}
        <button
          className={`pagination-btn pagination-prev ${currentPage === 1 ? 'disabled' : ''}`}
          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15,18 9,12 15,6"></polyline>
          </svg>
          <span className="pagination-text">Попередня</span>
        </button>

        {/* Номери сторінок */}
        <div className="pagination-pages">
          {visiblePages.map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="pagination-dots">...</span>
              ) : (
                <button
                  className={`pagination-page ${page === currentPage ? 'active' : ''}`}
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Кнопка "Наступна" */}
        <button
          className={`pagination-btn pagination-next ${currentPage === totalPages ? 'disabled' : ''}`}
          onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <span className="pagination-text">Наступна</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9,18 15,12 9,6"></polyline>
          </svg>
        </button>
      </div>

      {/* Інформація про сторінки */}
      <div className="pagination-info">
        <span className="pagination-info-text">
          Сторінка {currentPage} з {totalPages}
        </span>
      </div>
    </div>
  );
};

export default CatalogPagination;