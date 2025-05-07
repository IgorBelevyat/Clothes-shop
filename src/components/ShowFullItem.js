import React, { Component } from 'react';

export class ShowFullItem extends Component {
  render() {
    const { item, onShowItem, onAdd } = this.props;

    return (
      <div className='full-item'>
        <div className='full-card'>
          <button className='back-button' onClick={() => onShowItem(item)}>
            ← Назад
          </button>
          <img className='full-image' src={item.image} alt='product' />
          <div className='full-info'>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
            <b>{item.price}$</b>
            <button className='item-button' onClick={() => onAdd(item)}>Добавить в корзину</button>
          </div>
        </div>
      </div>
    );
  }
}

export default ShowFullItem;
