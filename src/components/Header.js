import React, { useState } from 'react';
import { FaShoppingCart, FaUser } from "react-icons/fa";
import Order from './Order';
import { Link, useLocation } from 'react-router-dom';
import Banner from './Banner';

const showOrders = (props) => {
  let sum = 0;
  props.orders.forEach(el => sum += Number.parseFloat(el.price));
  return (
    <div>
      {props.orders.map(el => (
        <Order onDelete={props.onDelete} key={el.id} item={el} />
      ))}
      <p className='sum'>Total cost: {new Intl.NumberFormat().format(sum)}$</p>
    </div>
  );
};

const showNothing = () => {
  return (
    <div className='empty'>
      <h2>Cart is empty</h2>
    </div>
  );
};

export default function Header(props) {
  const [cartOpen, setCartOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const location = useLocation();

  const isLoggedIn = props.user !== null;
  const userFirstName = props.user?.firstName || '';
  const shouldShowBanner = props.showBanner !== false && location.pathname !== "/cms";

  const scrollToFooter = () => {
    document.querySelector("footer")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogout = () => {
    props.onLogout();
    setAccountMenuOpen(false);
  };

  return (
    <header className='header'>
      <div className='header-container'>
        <span className='logo'>Clothing store</span>
        <ul className='nav'>
          <li><Link to="/">Home</Link></li>
          
          {isLoggedIn && (
            <li><Link to="/cabinet">My Cabinet</Link></li>
          )}

          <li onClick={scrollToFooter} style={{ cursor: 'pointer' }}>About us</li>
          <li onClick={scrollToFooter} style={{ cursor: 'pointer' }}>Contacts</li>

          {isLoggedIn && (props.user.role === 'admin' || props.user.role === 'content-manager') && (
            <li><Link to="/cms">CMS</Link></li>
          )}
        </ul>

        <div className="header-actions">
          <div className="account-section">
            {isLoggedIn ? (
              <span className="user-name">{userFirstName || 'Loading...'}</span>
            ) : (
              <>
                <FaUser
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className={`account-icon ${accountMenuOpen && 'active'}`}
                />
                {accountMenuOpen && (
                  <div className='account-dropdown'>
                    <div className="dropdown-content">
                      <Link to="/login" className="dropdown-link primary">
                        Увійти
                      </Link>
                      <Link to="/register" className="dropdown-link secondary">
                        Зареєструватися
                      </Link>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <FaShoppingCart
            onClick={() => setCartOpen(!cartOpen)}
            className={`shop-cart-button ${cartOpen && 'active'}`}
          />
        </div>

        {cartOpen && (
          <div className='shop-cart'>
            {props.orders.length > 0 ? showOrders(props) : showNothing()}
          </div>
        )}
      </div>
    </header>
  );
}