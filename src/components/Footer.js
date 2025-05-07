
import React from 'react';


export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>About us</h3>
          <p>
            Clothing Store — online store of stylish clothes. We offer the best collections for everyday and special life.
          </p>
        </div>

        <div className="footer-section">
          <h3>Contactacts</h3>
          <p>Email: contact@clothingstore.com</p>
          <p>Telephone: +38 (063) 123-45-67</p>
          <p>Addres: Kyiv, Shoping street, 12</p>
        </div>

        <div className="footer-section">
          <h3>Information</h3>
          <ul>
          <li><a href="/about">About company</a></li>
          <li><a href="/delivery">Delivery and payment</a></li>
          <li><a href="/warranty">Warranty and returns</a></li>
          <li><a href="/privacy-policy">Privacy Policy</a></li>
        </ul>

        </div>
      </div>
      <div className="footer-bottom">
        © {new Date().getFullYear()} Clothing Store. All rights reserved.
      </div>
    </footer>
  );
}
