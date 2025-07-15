// ОНОВЛЕНИЙ App.js - чистий з page компонентами

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Register from "./components/Auth/Register";
import Login from "./components/Auth/Login";
import CMS from './components/CMS';
import UserCabinet from './components/UserCabinet';
import { withRouter } from "./components/MainPage/withRouter";
import Banner from './components/MainPage/Banner';

// ІМПОРТ СТОРІНОК
import HomePage from './components/pages/HomePage';
import CatalogPage from './components/pages/CatalogPage';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      currentItems: [],
      items: [],
      categories: [],
      showFullItem: false,
      fullItem: {},
      user: null,
    };

    this.addToOrder = this.addToOrder.bind(this);
    this.deleteOrder = this.deleteOrder.bind(this);
    this.chooseCategory = this.chooseCategory.bind(this);
    this.onShowItem = this.onShowItem.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
  }

  componentDidMount() {
    // API запити залишаються такими ж
    fetch('http://localhost:3001/api/products')
      .then(res => res.json())
      .then(data => {
        const products = data.products || data;
        this.setState({ 
          items: Array.isArray(products) ? products : [], 
          currentItems: Array.isArray(products) ? products : [] 
        });
      })
      .catch(err => {
        console.error("Error fetching products:", err);
        this.setState({ items: [], currentItems: [] });
      });

    fetch('http://localhost:3001/api/categories')
      .then(res => res.json())
      .then(data => {
        this.setState({ categories: Array.isArray(data) ? data : [] });
      })
      .catch(err => {
        console.error("Error fetching categories:", err);
        this.setState({ categories: [] });
      });

    // Логіка аутентифікації
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        this.setState({ user: JSON.parse(savedUser) });
        fetch('http://localhost:3001/api/auth/me', { credentials: 'include' })
          .then(res => { if (!res.ok) this.setState({ user: null }); });
      } catch (e) {
        localStorage.removeItem('user');
      }
    } else {
      fetch('http://localhost:3001/api/auth/me', { credentials: 'include' })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) {
            this.setState({ user: data });
            localStorage.setItem('user', JSON.stringify(data));
          }
        });
    }
  }

  // ВСІ МЕТОДИ ЗАЛИШАЮТЬСЯ ТАКИМИ Ж
  handleLogout() {
    this.setState({ user: null });
    localStorage.removeItem('user');
    fetch('http://localhost:3001/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  }

  deleteOrder(id) {
    this.setState({ orders: this.state.orders.filter(el => el.id !== id) });
  }

  addToOrder(item) {
    if (!this.state.orders.some(el => el.id === item.id)) {
      this.setState({ orders: [...this.state.orders, item] });
    }
  }

  chooseCategory(categoryName) {
    if (categoryName === 'all') {
      this.setState({ currentItems: this.state.items });
    } else {
      if (this.state.items && Array.isArray(this.state.items) && this.state.items.length > 0) {
        let selectedCategory = null;
        const findCategoryByName = (categories, name) => {
          if (!Array.isArray(categories)) return null;
          
          for (let category of categories) {
            if (category.name === name) {
              return category;
            }
            if (category.children && category.children.length > 0) {
              const found = findCategoryByName(category.children, name);
              if (found) return found;
            }
          }
          return null;
        };

        selectedCategory = findCategoryByName(this.state.categories, categoryName);

        if (selectedCategory) {
          const categoryIds = [selectedCategory.id];
          const collectSubcategoryIds = (category) => {
            if (category.children && category.children.length > 0) {
              for (let child of category.children) {
                categoryIds.push(child.id);
                collectSubcategoryIds(child);
              }
            }
          };

          collectSubcategoryIds(selectedCategory);

          this.setState({
            currentItems: this.state.items.filter(el =>
              el.category && categoryIds.includes(el.categoryId)
            )
          });
        } else {
          this.setState({
            currentItems: this.state.items.filter(el =>
              el.category && el.category.name === categoryName
            )
          });
        }
      } else {
        this.setState({ currentItems: [] });
      }
    }
  }

  onShowItem(item) {
    this.setState({ fullItem: item, showFullItem: !this.state.showFullItem });
  }

  handleLogin(user) {
    this.setState({ user });
    localStorage.setItem('user', JSON.stringify(user));
  }

  render() {
    const { location } = this.props.router;
    const isAuthPage = location.pathname === "/register" || location.pathname === "/login";
    const isCmsPage = location.pathname === "/cms";
    const shouldShowHeader = !isAuthPage;
    const shouldShowBanner = !isAuthPage && !isCmsPage && location.pathname === "/";

    // ПРОПСИ ДЛЯ СТОРІНОК
    const pageProps = {
      categories: this.state.categories,
      currentItems: this.state.currentItems,
      showFullItem: this.state.showFullItem,
      fullItem: this.state.fullItem,
      chooseCategory: this.chooseCategory,
      onShowItem: this.onShowItem,
      onAdd: this.addToOrder
    };

    return (
      <>
        <div className="header-wrapper">
          {shouldShowHeader && (
            <Header
              orders={this.state.orders}
              onDelete={this.deleteOrder}
              user={this.state.user}
              onLogout={this.handleLogout}
            />
          )}
        </div>
        
        {shouldShowBanner && <Banner />}

        <div className="wrapper">
          <Routes>
            {/* ГОЛОВНА СТОРІНКА */}
            <Route
              path="/"
              element={<HomePage {...pageProps} />}
            />
            
            {/* КАТАЛОГ */}
            <Route
              path="/catalog"
              element={<CatalogPage {...pageProps} />}
            />
            
            {/* ІНШІ РОУТИ */}
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login onLogin={this.handleLogin} />} />
            <Route 
              path="/cabinet" 
              element={
                <UserCabinet 
                  user={this.state.user} 
                  orders={this.state.orders} 
                  onLogout={this.handleLogout} 
                />
              } 
            />
            <Route path="/cms" element={<CMS user={this.state.user} />} />
          </Routes>
        </div>

        {!isAuthPage && <Footer />}
      </>
    );
  }
}

const AppWithRouter = withRouter(App);

const AppWrapper = () => (
  <Router>
    <AppWithRouter />
  </Router>
);

export default AppWrapper;