// CatalogPage.js

import React, { Component } from 'react';
import CatalogFilters from '../Catalog/CatalogFilters';
import CatalogGrid from '../Catalog/CatalogGrid';
import CatalogHeader from '../Catalog/CatalogHeader';
import CatalogPagination from '../Catalog/CatalogPagination';
import '../Catalog/CatalogPage.css';

export class CatalogPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      categories: [],
      loading: false,
      error: '',
      
      // Фільтри
      selectedCategoryId: '',
      currentFilters: {},
      
      // Пагінація та сортування
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
      },
      sortBy: 'createdAt',
      sortOrder: 'desc',
      
      // Доступні фільтри для поточної категорії
      availableFilters: []
    };
  }

  componentDidMount() {
    this.fetchCategories();
    this.fetchProducts();
  }

  fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/categories', {
        credentials: 'include'
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      const data = await res.json();
      this.setState({ categories: data });
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  fetchProducts = async () => {
    this.setState({ loading: true, error: '' });
    
    try {
      const { currentFilters, pagination, selectedCategoryId, sortBy, sortOrder } = this.state;
      
      // Формуємо параметри запиту
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        sort: sortBy,
        order: sortOrder,
        ...currentFilters
      });

      if (selectedCategoryId) {
        params.set('category', selectedCategoryId);
      }

      const res = await fetch(`http://localhost:3001/api/products?${params.toString()}`, {
        credentials: 'include'
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await res.json();
      
      this.setState({
        products: data.products || data,
        pagination: {
          ...this.state.pagination,
          total: data.meta?.total || 0,
          totalPages: data.meta?.totalPages || 1
        }
      });
    } catch (err) {
      console.error('Error fetching products:', err);
      this.setState({ error: 'Failed to load products' });
    } finally {
      this.setState({ loading: false });
    }
  };

  fetchAvailableFilters = async (categoryId) => {
    if (!categoryId) {
      this.setState({ availableFilters: [] });
      return;
    }

    try {
      const res = await fetch(`http://localhost:3001/api/products/filters/${categoryId}`, {
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        this.setState({ availableFilters: data.filters || [] });
      }
    } catch (err) {
      console.error('Error fetching filters:', err);
    }
  };

  handleCategoryChange = (categoryId) => {
    this.setState({
      selectedCategoryId: categoryId,
      currentFilters: {}, // Очищуємо фільтри при зміні категорії
      pagination: { ...this.state.pagination, page: 1 }
    }, () => {
      this.fetchAvailableFilters(categoryId);
      this.fetchProducts();
    });
  };

  handleFiltersChange = (filters) => {
    this.setState({
      currentFilters: filters,
      pagination: { ...this.state.pagination, page: 1 }
    }, () => {
      this.fetchProducts();
    });
  };

  handleSortChange = (sortBy, sortOrder) => {
    this.setState({
      sortBy,
      sortOrder,
      pagination: { ...this.state.pagination, page: 1 }
    }, () => {
      this.fetchProducts();
    });
  };

  handleLimitChange = (limit) => {
    this.setState({
      pagination: { ...this.state.pagination, limit, page: 1 }
    }, () => {
      this.fetchProducts();
    });
  };

  handlePageChange = (page) => {
    this.setState({
      pagination: { ...this.state.pagination, page }
    }, () => {
      this.fetchProducts();
    });
  };

  render() {
    const {
      products,
      categories,
      loading,
      error,
      selectedCategoryId,
      availableFilters,
      pagination,
      sortBy,
      sortOrder
    } = this.state;

    return (
      <div className="catalog-page">
        <div className="catalog-wrapper">
        
          <div className="catalog-layout">
            
            {/* Ліва панель з фільтрами (жовтий контейнер) */}
            <aside className="catalog-sidebar">
              <CatalogFilters
                categoryId={selectedCategoryId}
                availableFilters={availableFilters}
                onFiltersChange={this.handleFiltersChange}
              />
            </aside>

            {/* Центральний контейнер (червоний контейнер) */}
            <div className="catalog-container">
              <div className="catalog-content">
                {/* Заголовок каталогу */}
                <CatalogHeader
                  categories={categories}
                  selectedCategoryId={selectedCategoryId}
                  onCategoryChange={this.handleCategoryChange}
                  totalProducts={pagination.total}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSortChange={this.handleSortChange}
                  limit={pagination.limit}
                  onLimitChange={this.handleLimitChange}
                />

                {/* Сітка товарів */}
                <main className="catalog-main">
                  <CatalogGrid
                    products={products}
                    loading={loading}
                    error={error}
                    onShowItem={this.props.onShowItem}
                  />

                  {/* Пагінація */}
                  {pagination.totalPages > 1 && (
                    <CatalogPagination
                      currentPage={pagination.page}
                      totalPages={pagination.totalPages}
                      onPageChange={this.handlePageChange}
                    />
                  )}
                </main>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default CatalogPage;