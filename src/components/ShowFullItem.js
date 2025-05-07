import React, { Component } from 'react';
import { FaAngleLeft } from 'react-icons/fa'

export class ShowFullItem extends Component {
  render() {
    const { item, onShowItem, onAdd } = this.props;

    return (
      <div className='full-item'>
        <div className='full-card'>
          <button className='back-button' onClick={() => onShowItem(item)}>
            <FaAngleLeft className="back-icon" />
          </button>
          <img className='full-image' src={item.image} alt='product' />
          <div className='full-info'>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
            <div className='btn-price-wraper'> 
              <button className='item-button' onClick={() => onAdd(item)}>Add to cart</button>
              <b>{item.price}$</b>
            </div>
            
          </div>
        </div>
      </div>
    );
  }
}

export default ShowFullItem;
