import React from 'react';
import './CarProcessSection.css';

const CarProcessSection = () => {
  const handleGoToSearch = () => {
    // Логіка для переходу до пошуку авто
    console.log('Перехід до пошуку авто');
  };

  return (
    <section className="car-process-section">
      <div className="car-process-container">
        <h2 className="car-process-title">Як оформити авто на Rozborka121</h2>
        
        <div className="process-steps">
          <div className="step-item">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3 className="step-title">Заповнити форму</h3>
            </div>
          </div>

          <div className="step-item">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3 className="step-title">Дочекатися дзвінка від нашого менеджера</h3>
            </div>
          </div>

          <div className="step-item">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3 className="step-title">Пройти з нами процес оформлення</h3>
            </div>
          </div>

          <div className="step-item">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3 className="step-title">Авто ваше</h3>
            </div>
          </div>
        </div>

        <button className="process-cta-btn" onClick={handleGoToSearch}>
          ПЕРЕЙТИ ДО ПОШУКУ АВТО
        </button>
      </div>
    </section>
  );
};

export default CarProcessSection;