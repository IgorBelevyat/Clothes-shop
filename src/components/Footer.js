import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Про Rozborka121</h3>
          <p>
            Rozborka121 — онлайн-платформа для купівлі та продажу автомобілів. Ми пропонуємо найкращі авто та допомагаємо з оформленням усіх документів швидко та безпечно.
          </p>
          <div className="footer-social-links">
            <a href="#" className="footer-social-link" aria-label="Facebook">
              FB
            </a>
            <a href="#" className="footer-social-link" aria-label="Instagram">
              IG
            </a>
            <a href="#" className="footer-social-link" aria-label="Telegram">
              TG
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h3>Контакти</h3>
          <div className="footer-contact-item">
            <div className="footer-contact-icon">✉️</div>
            <div className="footer-contact-text">Rozborka121@gmail.com</div>
          </div>
          
          <div className="footer-contact-item">
            <div className="footer-contact-icon">📞</div>
            <div className="footer-contact-text">+38 (067) 123-45-67</div>
          </div>
          
          <div className="footer-contact-item">
            <div className="footer-contact-icon">📍</div>
            <div className="footer-contact-text">вулиця Героїв Оборони, 10, Київ, Київська область</div>
          </div>
        </div>

        <div className="footer-section">
          <h3>Послуги</h3>
          <ul>
            <li><a href="/buy">Купівля авто</a></li>
            <li><a href="/sell">Продаж авто</a></li>
            <li><a href="/consultation">Консультації</a></li>
            <li><a href="/documents">Оформлення документів</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Інформація</h3>
          <ul>
            <li><a href="/about">Про компанію</a></li>
            <li><a href="/how-it-works">Як це працює</a></li>
            <li><a href="/reviews">Відгуки</a></li>
            <li><a href="/privacy-policy">Політика конфіденційності</a></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <div className="footer-copyright">
            © {new Date().getFullYear()} Rozborka121. Усі права захищені.
          </div>
          <div className="footer-bottom-links">
            <a href="/privacy">Політика конфіденційності</a>
            <a href="/terms">Умови використання</a>
            <a href="/sitemap">Карта сайту</a>
          </div>
        </div>
      </div>
    </footer>
  );
}