import React, { useState, useEffect } from 'react';

const Banner = () => {
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAutoSliding, setIsAutoSliding] = useState(true);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/banner');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        
        if (data.length === 0) {
          setSlides([{
            id: 'default',
            imageUrl: '/img/header-bg.jpg', 
            title: 'КРАЩИЙ СПОСІБ',
            subtitle: 'придбати власний автомобіль',
            linkText: 'ЗНАЙТИ СВОЄ АВТО',
            linkUrl: '#'
          }]);
        } else {
          setSlides(data);
          console.log('Slides received from API:', data);

        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching banner slides:', error);
        setError('Failed to load banner');

        setSlides([{
          id: 'default',
          imageUrl: '/img/header-bg.jpg',
          title: 'КРАЩИЙ СПОСІБ',
          subtitle: 'придбати власний автомобіль',
          linkText: 'ЗНАЙТИ СВОЄ АВТО',
          linkUrl: '#'
        }]);
        setLoading(false);
      }
    };

    fetchSlides();
  }, []);

  useEffect(() => {
    if (!isAutoSliding || slides.length <= 1) return; 
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); 

    return () => clearInterval(interval);
  }, [slides.length, isAutoSliding]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoSliding(false);
    setTimeout(() => setIsAutoSliding(true), 10000); 
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoSliding(false);
    setTimeout(() => setIsAutoSliding(true), 10000); 
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    setIsAutoSliding(false);
    setTimeout(() => setIsAutoSliding(true), 10000); 
  };

  if (loading) {
    return <div className="banner-loading">Loading banner...</div>;
  }

  if (error) {
    return <div className="banner-error">{error}</div>;
  }

  if (slides.length === 0) {
    return null; 
  }

  return (
    <div className="hero-banner">
      <div className="hero-slider">
        {slides.map((slide, index) => (
          <div 
            key={slide.id} 
            className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
          >
            <div className="hero-background">
              <img src={slide.imageUrl} alt={slide.title || 'Banner'} />
            </div>
            
            <div className="hero-content">
              <div className="hero-content-wrapper">
                <div className="hero-text">
                  {slide.title && (
                    <h1 className="hero-title">
                      {slide.title}
                    </h1>
                  )}
                  {slide.subtitle && (
                    <p className="hero-subtitle">
                      {slide.subtitle}
                    </p>
                  )}
                  {slide.linkUrl && slide.linkText && (
                    <a href={slide.linkUrl} className="hero-btn">
                      {slide.linkText}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <>
          <button onClick={prevSlide} className="hero-nav-btn hero-prev" aria-label="Previous slide">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button onClick={nextSlide} className="hero-nav-btn hero-next" aria-label="Next slide">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          <div className="hero-indicators">
            {slides.map((_, index) => (
              <button 
                key={index} 
                onClick={() => goToSlide(index)}
                className={`hero-indicator ${index === currentSlide ? 'active' : ''}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Banner;