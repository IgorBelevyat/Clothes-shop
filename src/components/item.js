import React, { Component } from 'react';

export class Item extends Component {
  render() {
    const { item, onShowItem, onAdd } = this.props;
    return (
      <div className='item-card'>
        <img
          className='item-image'
          src={item.image}
          alt='product'
          onClick={() => onShowItem(item)}
        />
        <div className='item-content'>
          <h2 className='item-title'>{item.title}</h2>
          <p className='item-desc'>{item.description}</p>
          <div className='item-bottom'>
            <b className='item-price'>{item.price}$</b>
            <button className='item-button' onClick={() => onAdd(item)}>Add to cart</button>
          </div>
        </div>
      </div>
    );
  }
}

export default Item;
