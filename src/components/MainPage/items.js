//items.js

import React, { Component } from 'react'
import Item from './item';
import './items.css';

export class Items extends Component {
  render() {
    // ДОДАНО: перевірка на існування та тип items
    const items = this.props.items;
    
    if (!items || !Array.isArray(items)) {
      return (
        <section className="items-section">
          <div className="items-wrapper">
            <div className="items-container">
              <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
                Loading products...
              </div>
            </div>
          </div>
        </section>
      );
    }

    if (items.length === 0) {
      return (
        <section className="items-section">
          <div className="items-wrapper">
            <div className="items-container">
              <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
                No products found
              </div>
            </div>
          </div>
        </section>
      );
    }

    // НОВИЙ КОД: фільтруємо та показуємо тільки 6 останніх товарів
    const getLatestItems = (items) => {
      // Сортуємо по ID в порядку спадання (найновіші спочатку)
      // Припускаємо, що більший ID = новіший товар
      const sortedItems = [...items].sort((a, b) => b.id - a.id);
      
      // Альтернативний варіант сортування по даті створення (якщо є поле createdAt):
      // const sortedItems = [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      // Повертаємо тільки перші 6 елементів
      return sortedItems.slice(0, 6);
    };

    const latestItems = getLatestItems(items);

    return (
      <section className="items-section">
        <div className="items-wrapper">
          <div className="items-container">
            {/* ЗАГОЛОВОК БЕЗ ЛІЧИЛЬНИКА */}
            <div className="items-header">
              <h2 className="items-title">Нові оголошення</h2>
            </div>
            
            {/* ІСНУЮЧА СІТКА ТОВАРІВ - ТЕПЕР ПОКАЗУЄ ТІЛЬКИ 6 ОСТАННІХ */}
            <main className="items-grid">
              {latestItems.map(el => (
                <Item 
                  onShowItem={this.props.onShowItem} 
                  key={el.id} 
                  item={el} 
                  onAdd={this.props.onAdd}
                />
              ))}
            </main>
          </div>
        </div>
      </section>
    )
  }
}

export default Items;