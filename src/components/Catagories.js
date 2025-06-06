import React, { useState, useEffect } from 'react';


function Categories({ categories: initialCategories, chooseCategory }) {
  const [columns, setColumns] = useState([]);
  const [selectedPath, setSelectedPath] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (initialCategories && initialCategories.length > 0) {
      setColumns([initialCategories]);
    } else {
      setColumns([]);
    }
    setSelectedPath([]);
  }, [initialCategories]);

  const toggleMenu = () => {
    setMenuOpen(prev => !prev);
  };

  const handleCategoryItemClick = (item, columnIndex) => {
    let newSelectedPathIds;
    let finalColumns;
    let categoryToFilterName;

    if (item.isAllModelsOption) {
      newSelectedPathIds = selectedPath.slice(0, columnIndex);
      categoryToFilterName = item.parentCategoryName;
      finalColumns = columns.slice(0, columnIndex + 1);
    } else {
      newSelectedPathIds = [...selectedPath.slice(0, columnIndex), item.id];
      categoryToFilterName = item.name;

      const currentVisibleColumns = columns.slice(0, columnIndex + 1);
      if (item.children && item.children.length > 0) {
        const childrenOfItem = [
          {
            id: `all-models-${item.id}`,
            name: `All models ${item.name}`,
            isAllModelsOption: true,
            parentCategoryId: item.id,
            parentCategoryName: item.name,
          },
          ...item.children,
        ];
        finalColumns = [...currentVisibleColumns, childrenOfItem];
      } else {
        finalColumns = currentVisibleColumns;
      }
    }

    setSelectedPath(newSelectedPathIds);
    setColumns(finalColumns);
    chooseCategory(categoryToFilterName);
  };

  const handleGlobalAllCategoriesClick = () => {
    chooseCategory('all');
    if (initialCategories && initialCategories.length > 0) {
      setColumns([initialCategories]);
    } else {
      setColumns([]);
    }
    setSelectedPath([]);
  };

  if (!initialCategories) {
    return <div className="flyout-categories-outer-container">Loading categoris...</div>;
  }

  return (
    <div className="categories-container">
      <button className="toggle-menu-button" onClick={toggleMenu}>
        {menuOpen ? 'Close filters' : 'Filters'}
      </button>

      {menuOpen && (
        <div className="flyout-categories-outer-container">
          <div
            className={`flyout-category-item flyout-global-all-item ${selectedPath.length === 0 ? 'active' : ''}`}
            onClick={handleGlobalAllCategoriesClick}
          >
            All categories
          </div>
          <div className="flyout-columns-wrapper">
            {columns.map((columnItems, columnIndex) => (
              <div key={columnIndex} className="flyout-category-column">
                {columnItems.map((item) => {
                  const itemIsActive =
                    !item.isAllModelsOption &&
                    selectedPath[columnIndex] === item.id &&
                    columns[columnIndex + 1]?.[0]?.isAllModelsOption &&
                    columns[columnIndex + 1]?.[0]?.parentCategoryId === item.id;

                  const hasArrow = !item.isAllModelsOption && item.children?.length > 0;

                  return (
                    <div
                      key={item.id}
                      className={`flyout-category-item ${itemIsActive ? 'active' : ''} ${item.isAllModelsOption ? 'flyout-all-models-option' : ''}`}
                      onClick={() => handleCategoryItemClick(item, columnIndex)}
                    >
                      <span>{item.name}</span>
                      {hasArrow && <span className="flyout-arrow">&gt;</span>}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Categories;
