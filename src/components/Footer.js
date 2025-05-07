
import React from 'react';


export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>О нас</h3>
          <p>
            Clothing Store — онлайн-магазин стильной одежды. Мы предлагаем лучшие коллекции для повседневной и особенной жизни.
          </p>
        </div>

        <div className="footer-section">
          <h3>Контакты</h3>
          <p>Email: contact@clothingstore.com</p>
          <p>Телефон: +38 (063) 123-45-67</p>
          <p>Адрес: Киев, ул. Шопінгова, 12</p>
        </div>

        <div className="footer-section">
          <h3>Информация</h3>
          <ul>
          <li><a href="/about">О компании</a></li>
          <li><a href="/delivery">Доставка и оплата</a></li>
          <li><a href="/warranty">Гарантия и возврат</a></li>
          <li><a href="/privacy-policy">Политика конфиденциальности</a></li>
        </ul>

        </div>
      </div>
      <div className="footer-bottom">
        © {new Date().getFullYear()} Clothing Store. Все права защищены.
      </div>
    </footer>
  );
}
