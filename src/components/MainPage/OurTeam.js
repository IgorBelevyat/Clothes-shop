// src/components/MainPage/OurTeam.js

import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import './OurTeam.css';

const OurTeam = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const teamMembers = [
    {
      id: 1,
      name: "Юрій Попович",
      position: "CEO",
      image: '/img/1.png',
      description: "Досвідчений керівник з 10+ років досвіду в автомобільній сфері"
    },
    {
      id: 2,
      name: "Олег Кінаш",
      position: "Керівник сервісу",
      image: "/img/2.png",
      description: "Експерт з технічного обслуговування та ремонту автомобілів"
    },
    {
      id: 3,
      name: "Павло Кміть",
      position: "Керівник відділу SMM",
      image: "/img/3.png",
      description: "Спеціаліст з digital-маркетингу та розвитку бренду"
    },
    {
      id: 4,
      name: "Анна Шевченко",
      position: "Менеджер з продажу",
      image: "",
      description: "Професіонал з підбору автомобілів та роботи з клієнтами"
    },
    {
      id: 5,
      name: "Михайло Коваль",
      position: "Головний механік",
      image: "",
      description: "Сертифікований спеціаліст з діагностики та ремонту"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => {
      const nextIndex = prev + 1;
      return nextIndex >= teamMembers.length - 2 ? 0 : nextIndex;
    });
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => {
      const prevIndex = prev - 1;
      return prevIndex < 0 ? teamMembers.length - 3 : prevIndex;
    });
  };

  return (
    <section className="our-team">
      <div className="our-team-container">
        <h2 className="our-team-title">
          НАША <span>КОМАНДА</span>
        </h2>
        
        <div className="team-description">
          <p>
            Badzinger Auto — ваш надійний партнер у світі автомобілів з Європи. 
            Ми спеціалізуємося на підборі, купівлі, продажу та доставці автомобілів, 
            включаючи сучасні електромобілі, з провідних європейських ринків.
          </p>
        </div>

        <div className="team-slider">
          <div className="team-slider-container">
            <div 
              className="team-slider-track"
              style={{
                transform: `translateX(-${currentSlide * (100 / 5)}%)`,
              }}
            >
              {teamMembers.map((member) => (
                <div key={member.id} className="team-card">
                  <div className="team-card-image">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      onError={(e) => {
                        e.target.src = '/images/placeholder-avatar.jpg';
                      }}
                    />
                  </div>
                  <div className="team-card-content">
                    <h3 className="team-member-name">{member.name}</h3>
                    <p className="team-member-position">{member.position}</p>
                    <p className="team-member-description">{member.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {teamMembers.length > 3 && (
            <div className="team-navigation">
              <button 
                className="nav-btn nav-btn-prev" 
                onClick={prevSlide}
                aria-label="Попередній співробітник"
              >
                <FaChevronLeft />
              </button>
              <button 
                className="nav-btn nav-btn-next" 
                onClick={nextSlide}
                aria-label="Наступний співробітник"
              >
                <FaChevronRight />
              </button>
            </div>
          )}
        </div>

        <div className="team-cta">
          <button className="team-cta-btn">
            ЗВ'ЯЗАТИСЯ З НАМИ
          </button>
        </div>
      </div>
    </section>
  );
};

export default OurTeam;