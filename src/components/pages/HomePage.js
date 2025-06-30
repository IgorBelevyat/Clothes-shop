// src/components/pages/HomePage.js

import React from 'react';
import Categories from '../MainPage/Catagories';
import Items from '../MainPage/items';
import WhyChooseUs from '../MainPage/WhyChooseUs';
import CarProcessSection from '../MainPage/CarProcessSection';
import OurTeam from '../MainPage/OurTeam';
import ShowFullItem from '../MainPage/ShowFullItem';

const HomePage = ({
  categories,
  currentItems,
  showFullItem,
  fullItem,
  chooseCategory,
  onShowItem,
  onAdd
}) => {
  return (
    <>
      {/* КАТЕГОРІЇ */}
      <Categories
        categories={categories}
        chooseCategory={chooseCategory}
      />
      
      {/* ОСТАННІ 6 ТОВАРІВ */}
      <Items
        onShowItem={onShowItem}
        items={currentItems || []}
        onAdd={onAdd}
        showAll={false}
        pageTitle="Нові оголошення"
      />
      
      {/* ДОДАТКОВІ СЕКЦІЇ ТІЛЬКИ НА ГОЛОВНІЙ */}
      <WhyChooseUs />
      <CarProcessSection />
      <OurTeam />
      
      {/* МОДАЛЬНЕ ВІКНО ТОВАРУ */}
      {showFullItem && (
        <ShowFullItem
          onAdd={onAdd}
          onShowItem={onShowItem}
          item={fullItem}
        />
      )}
    </>
  );
};

export default HomePage;