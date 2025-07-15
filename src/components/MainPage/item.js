//item.js

import React, { Component } from 'react';
import './item.css';

export class Item extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentImageIndex: 0
    };
  }

  render() {
    const { item, onShowItem, onAdd } = this.props;
    const { currentImageIndex } = this.state;
    
    // Функція для форматування ціни
    const formatPrice = (price) => {
      return new Intl.NumberFormat('uk-UA').format(price);
    };

    // Функція для скорочення тексту
    const truncateText = (text, maxLength = 50) => {
      if (!text) return '';
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    // ВИПРАВЛЕНА ФУНКЦІЯ: правильно обробляємо структуру даних
    const getAllImages = () => {
      // Спочатку шукаємо в новому форматі (масив images)
      if (item.images && item.images.length > 0) {
        // Зображення можуть бути:
        // 1. Масивом строк: ["url1", "url2", ...]
        // 2. Масивом об'єктів: [{imageUrl: "url1"}, {imageUrl: "url2"}, ...]
        
        return item.images.map(img => {
          if (typeof img === 'string') {
            return img; // Якщо це просто URL-строка
          } else if (img && img.imageUrl) {
            return img.imageUrl; // Якщо це об'єкт з imageUrl
          } else if (img && img.url) {
            return img.url; // Можливо поле називається url?
          } else {
            console.warn('Невідома структура зображення:', img);
            return img; // Повертаємо як є
          }
        });
      }
      
      // Якщо немає images, використовуємо старий формат (поле image)
      if (item.image) {
        return [item.image];
      }
      
      // Якщо зображень немає взагалі
      return ['/placeholder-image.jpg'];
    };

    // НОВА ФУНКЦІЯ: отримання поточного зображення
    const getCurrentImage = () => {
      const images = getAllImages();
      return images[currentImageIndex] || images[0];
    };

    // НОВА ФУНКЦІЯ: перехід до наступного зображення
    const nextImage = (e) => {
      e.stopPropagation(); // Запобігаємо спрацьовуванню onClick на картинці
      const images = getAllImages();
      if (images.length > 1) {
        this.setState({
          currentImageIndex: (currentImageIndex + 1) % images.length
        });
      }
    };

    // НОВА ФУНКЦІЯ: перехід до попереднього зображення
    const prevImage = (e) => {
      e.stopPropagation();
      const images = getAllImages();
      if (images.length > 1) {
        this.setState({
          currentImageIndex: currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1
        });
      }
    };

    // НОВА ФУНКЦІЯ: перехід до конкретного зображення
    const goToImage = (index, e) => {
      e.stopPropagation();
      this.setState({ currentImageIndex: index });
    };

    const images = getAllImages();
    const hasMultipleImages = images.length > 1;

    return (
      <div className='item-card'>
        <div className="item-image-container">
          <img
            className='item-image'
            src={getCurrentImage()}
            alt='product'
            onClick={() => onShowItem(item)}
            onError={(e) => {
              // Fallback якщо зображення не завантажилось
              e.target.src = '/placeholder-image.jpg';
            }}
          />
          
          <button className="favorite-btn" title="Додати до обраного">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
          
          {/* СЛАЙДЕР ЗОБРАЖЕНЬ */}
          {hasMultipleImages && (
            <>
              {/* Кнопки навігації */}
              <button 
                className="slider-btn slider-btn-prev" 
                onClick={prevImage}
                title="Попереднє зображення"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15,18 9,12 15,6"></polyline>
                </svg>
              </button>
              
              <button 
                className="slider-btn slider-btn-next" 
                onClick={nextImage}
                title="Наступне зображення"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9,18 15,12 9,6"></polyline>
                </svg>
              </button>
              
              {/* Індикатори (точки) */}
              <div className="slider-dots">
                {images.map((_, index) => (
                  <button
                    key={index}
                    className={`slider-dot ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={(e) => goToImage(index, e)}
                    title={`Зображення ${index + 1}`}
                  />
                ))}
              </div>
              
              {/* Лічильник зображень */}
              <div className="images-counter">
                {currentImageIndex + 1} / {images.length}
              </div>
            </>
          )}
        </div>
        
        <div className='item-content'>
          <h2 className='item-title' onClick={() => onShowItem(item)}>
            {item.title}
          </h2>
          
          <p className='item-desc'>{truncateText(item.description, 100)}</p>
          
          {/* НОВА СЕКЦІЯ З ХАРАКТЕРИСТИКАМИ */}
          <div className="item-specs">
            {item.mileage && (
              <div className="spec-item">
                <svg className="spec-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12,6 12,12 16,14"></polyline>
                </svg>
                <span className="spec-text">{item.mileage}</span>
              </div>
            )}
            
            {item.transmission && (
              <div className="spec-item">
                <svg className="spec-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="9" y1="9" x2="9" y2="15"></line>
                  <line x1="15" y1="9" x2="15" y2="15"></line>
                </svg>
                <span className="spec-text">{item.transmission}</span>
              </div>
            )}
            
            {item.wheelbase && (
              <div className="spec-item">
                <svg className="spec-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="6" cy="19" r="3"></circle>
                  <circle cx="18" cy="19" r="3"></circle>
                  <path d="M6 16V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8"></path>
                </svg>
                <span className="spec-text">{item.wheelbase}</span>
              </div>
            )}
            
            {item.fuelType && (
              <div className="spec-item">
                <svg className="spec-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12h18m-9-9v18"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <span className="spec-text">{item.fuelType}</span>
              </div>
            )}
          </div>
          
          <div className='item-bottom'>
            <div className="price-section">
              <b className='item-price'>${formatPrice(item.price)}</b>
              {item.price && (
                <span className="price-uah">
                  {formatPrice(Math.round(item.price * 42))} ₴
                </span>
              )}
            </div>
            <button 
              className='item-button' 
              onClick={() => onShowItem(item)}
              title="Переглянути деталі"
            >
              ДИВИТИСЬ АВТО
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default Item;