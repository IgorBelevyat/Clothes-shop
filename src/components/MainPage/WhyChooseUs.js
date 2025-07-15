// СТВОРИТИ НОВИЙ ФАЙЛ: src/components/MainPage/WhyChooseUs.js

import React from 'react';
import './WhyChooseUs.css';

const WhyChooseUs = () => {
  const advantages = [
    {
      id: 1,
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12,2 15.09,8.26 22,9 17,14.74 18.18,21.02 12,17.77 5.82,21.02 7,14.74 2,9 8.91,8.26"></polygon>
        </svg>
      ),
      title: "5 років досвіду",
      description: "Професійна робота з комерційною технікою"
    },
    {
      id: 2,
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 9V5a3 3 0 0 0-6 0v4"></path>
          <rect x="2" y="9" width="20" height="11" rx="2" ry="2"></rect>
        </svg>
      ),
      title: "1000+ задоволених клієнтів",
      description: "Довіра тисяч покупців по всій Україні"
    },
    {
      id: 3,
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="3" width="15" height="13"></rect>
          <polygon points="16,8 20,8 23,11 23,16 16,16 16,8"></polygon>
          <circle cx="5.5" cy="18.5" r="2.5"></circle>
          <circle cx="18.5" cy="18.5" r="2.5"></circle>
        </svg>
      ),
      title: "Понад 1000 одиниць техніки",
      description: "Великий вибір комерційних автомобілів"
    },
    {
      id: 4,
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12,6 12,12 16,14"></polyline>
        </svg>
      ),
      title: "Швидке фінансове рішення за 2 години",
      description: "Оперативне оформлення кредиту та лізингу"
    },
    {
      id: 5,
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12V7a7 7 0 1 1 14 0v5"></path>
          <rect x="2" y="12" width="20" height="8" rx="2" ry="2"></rect>
        </svg>
      ),
      title: "Онлайн-продаж без виїзду",
      description: "Купуйте техніку не виходячи з дому"
    },
    {
      id: 'consultation',
      type: 'consultation',
      title: "Наші консультанти можуть розповісти більше",
      buttonText: "ЗАМОВИТИ КОНСУЛЬТАЦІЮ"
    }
  ];

  const renderCard = (item) => {
    if (item.type === 'consultation') {
      return (
        <div key={item.id} className="advantage-card consultation-card">
          <h3 className="consultation-title">{item.title}</h3>
          <button className="consultation-btn">{item.buttonText}</button>
        </div>
      );
    }

    return (
      <div key={item.id} className="advantage-card">
        <div className="advantage-icon">
          {item.icon}
        </div>
        <h3 className="advantage-title">{item.title}</h3>
        <p className="advantage-description">{item.description}</p>
      </div>
    );
  };

  return (
    <section className="why-choose-us">
      <div className="why-choose-us-container">
        <h2 className="why-choose-us-title">Чому слід обрати нас?</h2>
        
        <div className="advantages-grid">
          {advantages.slice(0, 3).map(renderCard)}
        </div>

        <div className="advantages-bottom">
          {advantages.slice(3).map(renderCard)}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;