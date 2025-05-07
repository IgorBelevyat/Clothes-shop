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
            title: 'Welcome to our store',
            subtitle: 'Best products for best prices'
          }]);
        } else {
          setSlides(data);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching banner slides:', error);
        setError('Failed to load banner');

        setSlides([{
          id: 'default',
          imageUrl: '/img/header-bg.jpg',
          title: 'Welcome to our store',
          subtitle: 'Best products for best prices'
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
    <div className="banner-container">
      <div className="banner-slider">
        {slides.map((slide, index) => (
          <div 
            key={slide.id} 
            className={`banner-slide ${index === currentSlide ? 'active' : ''}`}
            style={{ 
              backgroundImage: `url(${slide.imageUrl})`,
              opacity: index === currentSlide ? 1 : 0
            }}
          >
            <div className="banner-content">
              {slide.title && <h2 className="banner-title">{slide.title}</h2>}
              {slide.subtitle && <p className="banner-subtitle">{slide.subtitle}</p>}
              {slide.linkUrl && (
                <a href={slide.linkUrl} className="banner-btn">
                  Learn More
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <>
          <button onClick={prevSlide} className="banner-nav-btn prev-btn" aria-label="Previous slide">
            ❮
          </button>
          <button onClick={nextSlide} className="banner-nav-btn next-btn" aria-label="Next slide">
            ❯
          </button>
          
          <div className="banner-dots">
            {slides.map((_, index) => (
              <button 
                key={index} 
                onClick={() => goToSlide(index)}
                className={`banner-dot ${index === currentSlide ? 'active' : ''}`}
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