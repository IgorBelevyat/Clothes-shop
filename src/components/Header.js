import React, { useState } from 'react'
import { FaShoppingCart } from "react-icons/fa";
import Order from './Order';
import { Link } from 'react-router-dom'

const showOrders = (props) => {
  let sum = 0
  props.orders.forEach(el => sum += Number.parseFloat(el.price));
  return (<div>
    {props.orders.map(el => (
      <Order onDelete={props.onDelete} key = {el.id} item = {el} />
        ))
     }
     <p className='sum'>Total cost: {new Intl.NumberFormat().format(sum)}$</p>
  </div>)
}

const showNothing = () => {
  return (<div className='empty'> 
    <h2>Cart is empty</h2>
  </div>)
}

export default function Header(props) {
  let [cartOpen, setCartOpen] = useState(false)

  return (
    <header>
        <div>
            <span className='logo'>Clothing store</span>
            <ul className='nav'>
              <li>About us</li>
              <li>Contacts</li>
              <li>My cabinet</li>
              <li><Link to="/register">Register</Link></li>
            </ul>
            <FaShoppingCart onClick={() => setCartOpen(cartOpen = !cartOpen)} className={`shop-cart-button ${cartOpen && 'active'}`}/>

            {cartOpen && (
              <div className='shop-cart'>
                {props.orders.length > 0 ?
                showOrders(props) : showNothing()  
              }
              </div>
            )}
        </div>
        <div className='presentation'>

        </div>
    </header>
  )
}
