// РЕДАГУВАТИ ІСНУЮЧИЙ ФАЙЛ: Items.js

import React, { Component } from 'react'
import Item from './item';
import './items.css';

export class Items extends Component {
  render() {
    // ДОДАНО: перевірка на існування та тип items
    const items = this.props.items;
    
    if (!items || !Array.isArray(items)) {
      return (
        <main>
          <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
            Loading products...
          </div>
        </main>
      );
    }

    if (items.length === 0) {
      return (
        <main>
          <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
            No products found
          </div>
        </main>
      );
    }

    return (
      <main>
        {items.map(el => (
          <Item 
            onShowItem={this.props.onShowItem} 
            key={el.id} 
            item={el} 
            onAdd={this.props.onAdd}
          />
        ))}
      </main>
    )
  }
}

export default Items;