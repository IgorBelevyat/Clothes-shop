import React, { useState, useEffect, useRef } from 'react';
import { FaShoppingCart, FaUser, FaCar } from "react-icons/fa";
import Order from './MainPage/Order';
import { Link, useLocation } from 'react-router-dom';

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
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const location = useLocation();
  const navRef = useRef(null);

  const isLoggedIn = props.user !== null;
  const userFirstName = props.user?.firstName || '';

  // ФУНКЦІЯ: оновлення позиції індикатора
  const updateIndicator = () => {
    if (!navRef.current) return;

    const activeLink = navRef.current.querySelector('.nav-link-active');
    if (activeLink) {
      const navRect = navRef.current.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();
      
      setIndicatorStyle({
        left: linkRect.left - navRect.left,
        width: linkRect.width,
        opacity: 1
      });
    } else {
      setIndicatorStyle({ opacity: 0 });
    }
  };

  // ЕФЕКТ: оновлення індикатора при зміні роуту
  useEffect(() => {
    // Невелика затримка для завершення рендеру
    const timer = setTimeout(updateIndicator, 50);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // ЕФЕКТ: оновлення при resize вікна
  useEffect(() => {
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, []);

  // ФУНКЦІЯ: визначення активного роуту
  const isActiveRoute = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // ФУНКЦІЯ: отримання CSS класу для навігаційної вкладки
  const getNavLinkClass = (path, additionalClass = '') => {
    const baseClass = 'nav-link';
    const activeClass = isActiveRoute(path) ? 'nav-link-active' : '';
    return `${baseClass} ${additionalClass} ${activeClass}`.trim();
  };

  const scrollToFooter = () => {
    document.querySelector("footer")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogout = () => {
    props.onLogout();
    setAccountMenuOpen(false);
  };

  return (
    <header className='modern-header'>
      <div className='modern-header-container'>
        <div className='header-left'>
          <Link to="/" className='modern-logo'>
            <img 
              src='/img/Logo.png'
              alt="Rozborka 121" 
              className='logo-image'
            />
          </Link>
        </div>

        <nav className='modern-nav' ref={navRef}>
          {/* SLIDING INDICATOR */}
          <div 
            className="nav-indicator" 
            style={indicatorStyle}
          />
          
          <Link to="/" className={getNavLinkClass('/')}>
            Головна
          </Link>
          <Link to="/catalog" className={getNavLinkClass('/catalog', 'catalog-btn')}>
            <span>Каталог</span>
          </Link>
          <span 
            onClick={scrollToFooter} 
            className="nav-link nav-link-static"
          >
            Про нас
          </span>
          <span 
            onClick={scrollToFooter} 
            className="nav-link nav-link-static"
          >
            Контакти
          </span>
          
          {isLoggedIn && (
            <Link to="/cabinet" className={getNavLinkClass('/cabinet')}>
              Кабінет
            </Link>
          )}

          {isLoggedIn && (props.user.role === 'admin' || props.user.role === 'content-manager') && (
            <Link to="/cms" className={getNavLinkClass('/cms', 'admin-link')}>
              CMS
            </Link>
          )}
        </nav>

        <div className="modern-header-actions">
          <div className="account-section">
            {isLoggedIn ? (
              <div className="user-profile">
                <span className="modern-user-name">{userFirstName || 'Loading...'}</span>
                <button onClick={handleLogout} className="logout-btn">Вийти</button>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="auth-btn login-btn">Увійти</Link>
                <Link to="/register" className="auth-btn register-btn">Реєстрація</Link>
              </div>
            )}
          </div>

          <div className="cart-section">
            <button
              onClick={() => setCartOpen(!cartOpen)}
              className={`modern-cart-button ${cartOpen ? 'active' : ''}`}
            >
              <FaShoppingCart />
              {props.orders.length > 0 && (
                <span className="cart-count">{props.orders.length}</span>
              )}
            </button>

            {cartOpen && (
              <div className='modern-shop-cart'>
                {props.orders.length > 0 ? showOrders(props) : showNothing()}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}