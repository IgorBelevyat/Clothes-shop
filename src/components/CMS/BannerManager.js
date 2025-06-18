import React, { useState, useEffect } from 'react';
import './BannerManager.css';

const BannerManager = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  

  const [editMode, setEditMode] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    linkUrl: '',
    linkText: '',
    isActive: true
  });


  const fetchSlides = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/banner/cms', {
        credentials: 'include' 
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch banner slides');
      }
      
      const data = await response.json();
      setSlides(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching banner slides:', err);
      setError('Failed to load banner slides');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      linkUrl: '',
      linkText: '',
      isActive: true
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setCurrentSlide(null);
    setEditMode(false);
  };


  const handleEditSlide = (slide) => {
    setCurrentSlide(slide);
    setFormData({
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      linkUrl: slide.linkUrl || '',
      linkText: slide.linkText || '',
      isActive: slide.isActive
    });
    setPreviewUrl(slide.imageUrl);
    setEditMode(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formDataObj = new FormData();
      formDataObj.append('title', formData.title);
      formDataObj.append('subtitle', formData.subtitle);
      formDataObj.append('linkUrl', formData.linkUrl);
      formDataObj.append('linkText', formData.linkText);
      formDataObj.append('isActive', formData.isActive);
      
      if (selectedFile) {
        formDataObj.append('image', selectedFile);
      }

      let response;
      
      if (editMode && currentSlide) {
        response = await fetch(`http://localhost:3001/api/banner/cms/${currentSlide.id}`, {
          method: 'PUT',
          credentials: 'include',
          body: formDataObj
        });
      } else {
        response = await fetch('http://localhost:3001/api/banner/cms', {
          method: 'POST',
          credentials: 'include',
          body: formDataObj
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save banner slide');
      }

      await fetchSlides();
      resetForm();
    } catch (err) {
      console.error('Error saving banner slide:', err);
      setError('Failed to save banner slide');
    }
  };


  const handleDeleteSlide = async (slideId) => {
    if (!window.confirm('Are you sure you want to delete this slide?')) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3001/api/banner/cms/${slideId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete banner slide');
      }
      
      await fetchSlides();
      
      if (currentSlide && currentSlide.id === slideId) {
        resetForm();
      }
    } catch (err) {
      console.error('Error deleting banner slide:', err);
      setError('Failed to delete banner slide');
    }
  };

  const handleMoveSlide = async (slideId, direction) => {
    const slideIndex = slides.findIndex(slide => slide.id === slideId);
    if (
      (direction === 'up' && slideIndex === 0) || 
      (direction === 'down' && slideIndex === slides.length - 1)
    ) {
      return; 
    }
    
    const newSlides = [...slides];
    const newIndex = direction === 'up' ? slideIndex - 1 : slideIndex + 1;
    

    [newSlides[slideIndex], newSlides[newIndex]] = [newSlides[newIndex], newSlides[slideIndex]];
    setSlides(newSlides);
    

    try {
      const slideIds = newSlides.map(slide => slide.id);
      
      const response = await fetch('http://localhost:3001/api/banner/cms/reorder', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ slideIds })
      });
      
      if (!response.ok) {
        throw new Error('Failed to reorder slides');
      }
    } catch (err) {
      console.error('Error reordering slides:', err);
      setError('Failed to reorder slides');
      await fetchSlides();
    }
  };

  if (loading) {
    return <div className="loading">Loading banner slides...</div>;
  }

  return (
    <div className="banner-manager">
      <h2>Banner Manager</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="banner-manager-content">
        <div className="slide-form-container">
          <h3>{editMode ? 'Edit Slide' : 'Add New Slide'}</h3>
          
          <form onSubmit={handleSubmit} className="slide-form">
            <div className="form-group image-upload file-input-field">
              <label htmlFor="image">Slide Image:</label>
              <div className="file-input-container">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-input"
                />
                <label htmlFor="image" className="file-input-label">
                  <span className="upload-icon">📷</span>
                  <span>Choose an image</span>
                </label>
              </div>
            </div>

            {previewUrl && (
              <div className="image-preview-container">
                <div className="image-preview">
                  <img src={previewUrl} alt="Preview" />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl('');
                      document.getElementById('image').value = '';
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )}

            
            <div className="form-group">
              <label htmlFor="title">Title (optional)</label>
              <input 
                type="text" 
                id="title" 
                name="title" 
                value={formData.title} 
                onChange={handleInputChange}
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="subtitle">Subtitle (optional)</label>
              <input 
                type="text" 
                id="subtitle" 
                name="subtitle" 
                value={formData.subtitle} 
                onChange={handleInputChange}
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="linkUrl">Link URL (optional)</label>
              <input 
                type="text" 
                id="linkUrl" 
                name="linkUrl" 
                value={formData.linkUrl} 
                onChange={handleInputChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="linkText">Button Text (optional)</label>
              <input 
                type="text" 
                id="linkText" 
                name="linkText" 
                value={formData.linkText} 
                onChange={handleInputChange}
                className="form-control"
                placeholder="e.g. Learn More, Shop Now"
              />
            </div>
            
            <div className="form-group-checkbox">
            <h4 className=''>Active</h4>
              <input 
                type="checkbox" 
                id="isActive" 
                name="isActive" 
                checked={formData.isActive} 
                onChange={handleInputChange}
              />
            </div>

            
            <div className="form-buttons">
              <button type="submit" className="btn btn-primary">
                {editMode ? 'Update Slide' : 'Add Slide'}
              </button>
              {editMode && (
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
        
        <div className="slides-list-container">
          <h3>Current Slides</h3>
          {slides.length === 0 ? (
            <p>No slides added yet. Add your first slide!</p>
          ) : (
            <ul className="slides-list">
              {slides.map((slide, index) => (
                <li 
                  key={slide.id}
                  className={`slide-item ${!slide.isActive ? 'inactive' : ''}`}
                >
                  <div className="slide-content">
                    <div className="slide-thumb">
                      <img src={slide.imageUrl} alt={slide.title || 'Banner'} />
                    </div>
                    <div className="slide-info">
                      <h4>{slide.title || 'Untitled Slide'}</h4>
                      {slide.subtitle && <p>{slide.subtitle}</p>}
                      {slide.linkText && <span className="link-text">Button: {slide.linkText}</span>}
                      <div className="slide-meta">
                        <span className={`status ${slide.isActive ? 'active' : 'inactive'}`}>
                          {slide.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="order">Order: {index + 1}</span>
                      </div>
                    </div>
                    <div className="slide-actions">
                      <button 
                        onClick={() => handleEditSlide(slide)}
                        className="btn btn-sm btn-edit"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteSlide(slide.id)}
                        className="btn btn-sm btn-delete"
                      >
                        Delete
                      </button>
                      <div className="order-buttons">
                        {index > 0 && (
                          <button 
                            onClick={() => handleMoveSlide(slide.id, 'up')}
                            className="btn btn-sm btn-move"
                            title="Move Up"
                          >
                            ↑
                          </button>
                        )}
                        {index < slides.length - 1 && (
                          <button 
                            onClick={() => handleMoveSlide(slide.id, 'down')}
                            className="btn btn-sm btn-move"
                            title="Move Down"
                          >
                            ↓
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default BannerManager;