// РЕДАГУВАТИ ІСНУЮЧИЙ ФАЙЛ: CMS.js

import React, { useState } from 'react';
import AddProductForm from './CMS/AddProductForm';
import CategoryManager from './CMS/CategoryManager';
import ProductsTable from './CMS/ProductsTable';
import UsersTable from './CMS/UsersTable';
import BannerManager from './CMS/BannerManager';
import AttributeManager from './CMS/AttributeManager'; // НОВИЙ ІМПОРТ
import './CMS/BannerManager.css';

export default function CMS({ user }) {
  const [activeTab, setActiveTab] = useState('products'); 
  
  if (!user || (user.role !== 'admin' && user.role !== 'content-manager')) {
    return (
      <div className="cms-wrapper">
        <div className="cms-panel">
          <h2>CMS</h2>
          <p>Access denied. Admins or content managers only.</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch(activeTab) {
      case 'add-product':
        return <AddProductForm />;
      case 'categories':
        return <CategoryManager />;
      case 'products':
        return <ProductsTable />;
      case 'banner':
        return <BannerManager />;
      case 'attributes': // НОВИЙ КЕЙС
        return <AttributeManager />;
      case 'users':
        return user.role === 'admin' ? <UsersTable /> : (
          <div className="access-denied">
            <h3>Access Denied</h3>
            <p>Only administrators can manage users.</p>
          </div>
        );
      default:
        return <ProductsTable />;
    }
  };

  return (
    <div className="cms-layout">
      <div className="cms-sidebar">
        <h2>CMS Panel</h2>
        <nav className="cms-navigation">
          <ul>
            <li>
              <button 
                onClick={() => setActiveTab('products')}
                className={`sidebar-button ${activeTab === 'products' ? 'active' : ''}`}
              >
                📋 Manage Products
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('add-product')}
                className={`sidebar-button ${activeTab === 'add-product' ? 'active' : ''}`}
              >
                ➕ Add New Product
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('categories')}
                className={`sidebar-button ${activeTab === 'categories' ? 'active' : ''}`}
              >
                🗂️ Categories
              </button>
            </li>
            {/* НОВИЙ ПУНКТ МЕНЮ */}
            <li>
              <button 
                onClick={() => setActiveTab('attributes')}
                className={`sidebar-button ${activeTab === 'attributes' ? 'active' : ''}`}
              >
                🏷️ Attributes
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('banner')}
                className={`sidebar-button ${activeTab === 'banner' ? 'active' : ''}`}
              >
                🖼️ Banner Slider
              </button>
            </li>
            {user.role === 'admin' && (
              <li>
                <button 
                  onClick={() => setActiveTab('users')}
                  className={`sidebar-button ${activeTab === 'users' ? 'active' : ''}`}
                >
                  👥 Manage Users
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>

      <div className="cms-main-content">
        <div className="cms-panel">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}