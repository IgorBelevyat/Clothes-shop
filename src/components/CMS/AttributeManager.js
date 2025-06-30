//AttributeManager.js

import React, { useState, useEffect } from 'react';
import './AttributeManager.css';

export default function AttributeManager() {
  const [attributes, setAttributes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Стани для редагування
  const [editingAttribute, setEditingAttribute] = useState(null);
  const [editingValue, setEditingValue] = useState(null);

  // Форма створення атрибуту
  const [attributeForm, setAttributeForm] = useState({
    name: '',
    slug: '',
    type: 'SELECT',
    isFilterable: true,
    isRequired: false,
    unit: '',
    displayOrder: 0,
    dependsOn: null
  });

  // Форма додавання значення
  const [valueForm, setValueForm] = useState({
    attributeId: '',
    value: '',
    displayName: '',
    displayOrder: 0
  });

  // Форма прив'язки до категорії
  const [assignForm, setAssignForm] = useState({
    categoryId: '',
    attributeId: '',
    isRequired: false,
    displayOrder: 0
  });

  useEffect(() => {
    fetchAttributes();
    fetchCategories();
  }, []);

  const fetchAttributes = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/attributes', {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setAttributes(data);
      }
    } catch (err) {
      console.error('Помилка завантаження атрибутів:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/categories', {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Помилка завантаження категорій');
    }
  };

  const handleCreateAttribute = async () => {
    try {
      // Визначаємо наступний displayOrder
      const maxOrder = Math.max(...attributes.map(a => a.displayOrder || 0), 0);
      const attributeData = {
        ...attributeForm,
        displayOrder: maxOrder + 1,
        dependsOn: attributeForm.dependsOn
      };

      const res = await fetch('http://localhost:3001/api/attributes', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attributeData)
      });

      if (res.ok) {
        alert('Атрибут створено успішно!');
        setAttributeForm({
          name: '',
          slug: '',
          type: 'SELECT',
          isFilterable: true,
          isRequired: false,
          unit: '',
          displayOrder: 0,
          dependsOn: null
        });
        fetchAttributes();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Помилка створення атрибуту');
      }
    } catch (err) {
      alert('Помилка створення атрибуту');
    }
  };

  // Змінити порядок атрибуту
  const moveAttribute = async (attributeId, direction) => {
    const currentIndex = attributes.findIndex(a => a.id === attributeId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= attributes.length) return;

    const sortedAttributes = [...attributes];
    const [movedItem] = sortedAttributes.splice(currentIndex, 1);
    sortedAttributes.splice(newIndex, 0, movedItem);

    // Оновлюємо displayOrder для всіх атрибутів
    const updates = sortedAttributes.map((attr, index) => ({
      id: attr.id,
      displayOrder: index + 1
    }));

    try {
      const res = await fetch('http://localhost:3001/api/attributes/reorder', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      });

      if (res.ok) {
        fetchAttributes();
      } else {
        alert('Помилка зміни порядку');
      }
    } catch (err) {
      alert('Помилка зміни порядку');
    }
  };

  // Змінити порядок значення атрибуту
  const moveAttributeValue = async (attributeId, valueId, direction) => {
    const attribute = attributes.find(a => a.id === attributeId);
    if (!attribute || !attribute.attributeValues) return;

    const values = [...attribute.attributeValues];
    const currentIndex = values.findIndex(v => v.id === valueId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= values.length) return;

    const [movedItem] = values.splice(currentIndex, 1);
    values.splice(newIndex, 0, movedItem);

    // Оновлюємо displayOrder для всіх значень
    const updates = values.map((value, index) => ({
      id: value.id,
      displayOrder: index + 1
    }));

    try {
      const res = await fetch('http://localhost:3001/api/attributes/values/reorder', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      });

      if (res.ok) {
        fetchAttributes();
      } else {
        alert('Помилка зміни порядку значень');
      }
    } catch (err) {
      alert('Помилка зміни порядку значень');
    }
  };

  const handleUpdateAttribute = async (attributeId, updatedData) => {
    try {
      const res = await fetch(`http://localhost:3001/api/attributes/${attributeId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });

      if (res.ok) {
        alert('Атрибут оновлено успішно!');
        setEditingAttribute(null);
        fetchAttributes();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Помилка оновлення атрибуту');
      }
    } catch (err) {
      alert('Помилка оновлення атрибуту');
    }
  };

  const handleDeleteAttribute = async (attributeId) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цей атрибут? Це також видалить всі його значення.')) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:3001/api/attributes/${attributeId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        alert('Атрибут видалено успішно!');
        fetchAttributes();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Помилка видалення атрибуту');
      }
    } catch (err) {
      alert('Помилка видалення атрибуту');
    }
  };

  const handleAddValue = async () => {
    if (!valueForm.attributeId || !valueForm.value) return;

    try {
      // Визначаємо наступний displayOrder для значень цього атрибуту
      const attribute = attributes.find(a => a.id === parseInt(valueForm.attributeId));
      const maxOrder = attribute?.attributeValues ? 
        Math.max(...attribute.attributeValues.map(v => v.displayOrder || 0), 0) : 0;

      const valueData = {
        value: valueForm.value,
        displayName: valueForm.displayName,
        displayOrder: maxOrder + 1
      };

      const res = await fetch(`http://localhost:3001/api/attributes/${valueForm.attributeId}/values`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(valueData)
      });

      if (res.ok) {
        alert('Значення додано успішно!');
        setValueForm({
          attributeId: '',
          value: '',
          displayName: '',
          displayOrder: 0
        });
        fetchAttributes();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Помилка додавання значення');
      }
    } catch (err) {
      alert('Помилка додавання значення');
    }
  };

  const handleDeleteValue = async (valueId) => {
    if (!window.confirm('Ви впевнені, що хочете видалити це значення?')) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:3001/api/attributes/values/${valueId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        alert('Значення видалено успішно!');
        fetchAttributes();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Помилка видалення значення');
      }
    } catch (err) {
      alert('Помилка видалення значення');
    }
  };

  const handleUpdateValue = async (valueId, newValue, newDisplayName) => {
    try {
      const res = await fetch(`http://localhost:3001/api/attributes/values/${valueId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          value: newValue,
          displayName: newDisplayName
        })
      });

      if (res.ok) {
        alert('Значення оновлено успішно!');
        setEditingValue(null);
        fetchAttributes();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Помилка оновлення значення');
      }
    } catch (err) {
      alert('Помилка оновлення значення');
    }
  };

  const handleAssignToCategory = async () => {
    if (!assignForm.categoryId || !assignForm.attributeId) return;

    try {
      const res = await fetch('http://localhost:3001/api/attributes/assign', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignForm)
      });

      if (res.ok) {
        alert('Атрибут прив\'язано до категорії!');
        setAssignForm({
          categoryId: '',
          attributeId: '',
          isRequired: false,
          displayOrder: 0
        });
        fetchAttributes();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Помилка прив\'язки');
      }
    } catch (err) {
      alert('Помилка прив\'язки');
    }
  };

  const handleUnassignFromCategory = async (categoryId, attributeId) => {
    if (!window.confirm('Ви впевнені, що хочете відв\'язати цей атрибут від категорії?')) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:3001/api/attributes/unassign`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId, attributeId })
      });

      if (res.ok) {
        alert('Атрибут відв\'язано від категорії!');
        fetchAttributes();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Помилка відв\'язування');
      }
    } catch (err) {
      alert('Помилка відв\'язування');
    }
  };

  const flattenCategories = (categories, level = 0, result = []) => {
    categories.forEach(category => {
      result.push({
        id: category.id,
        name: category.name,
        level
      });
      
      if (category.children && category.children.length > 0) {
        flattenCategories(category.children, level + 1, result);
      }
    });
    
    return result;
  };

  const flatCategories = flattenCategories(categories);

  const handleNameChange = (name) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9а-я]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    
    setAttributeForm(prev => ({
      ...prev,
      name,
      slug
    }));
  };

  // Компонент для редагування атрибуту
  const AttributeEditForm = ({ attr }) => {
    const [editData, setEditData] = useState({
      name: attr.name,
      type: attr.type,
      isFilterable: attr.isFilterable,
      isRequired: attr.isRequired,
      unit: attr.unit || ''
    });

    return (
      <div className="attribute-edit-form">
        <h4>Редагування атрибуту</h4>
        <div className="edit-form-grid">
          <div>
            <label>Назва:</label>
            <input
              type="text"
              value={editData.name}
              onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
              className="form-input"
            />
          </div>
          
          <div>
            <label>Тип:</label>
            <select
              value={editData.type}
              onChange={(e) => setEditData(prev => ({ ...prev, type: e.target.value }))}
              className="form-input"
            >
              <option value="SELECT">Список (SELECT)</option>
              <option value="TEXT">Текст (TEXT)</option>
              <option value="NUMBER">Число (NUMBER)</option>
              <option value="RANGE">Діапазон (RANGE)</option>
              <option value="BOOLEAN">Так/Ні (BOOLEAN)</option>
            </select>
          </div>

          {(editData.type === 'NUMBER' || editData.type === 'RANGE') && (
            <div>
              <label>Одиниця виміру:</label>
              <input
                type="text"
                value={editData.unit}
                onChange={(e) => setEditData(prev => ({ ...prev, unit: e.target.value }))}
                placeholder="км, л, к.с."
                className="form-input"
              />
            </div>
          )}

          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={editData.isFilterable}
                onChange={(e) => setEditData(prev => ({ ...prev, isFilterable: e.target.checked }))}
              />
              Фільтр
            </label>
            
            <label>
              <input
                type="checkbox"
                checked={editData.isRequired}
                onChange={(e) => setEditData(prev => ({ ...prev, isRequired: e.target.checked }))}
              />
              Обов'язковий
            </label>
          </div>

          <div className="edit-form-buttons">
            <button
              onClick={() => handleUpdateAttribute(attr.id, editData)}
              className="btn btn-success"
            >
              Зберегти
            </button>
            <button
              onClick={() => setEditingAttribute(null)}
              className="btn btn-secondary"
            >
              Скасувати
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Компонент для редагування значення
  function EditValueForm({ value, onSave, onCancel }) {
    const [newValue, setNewValue] = useState(value.value);
    const [newDisplayName, setNewDisplayName] = useState(value.displayName || '');

    return (
      <div className="edit-value-form">
        <input
          type="text"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          className="edit-value-input"
          placeholder="Значення"
        />
        <input
          type="text"
          value={newDisplayName}
          onChange={(e) => setNewDisplayName(e.target.value)}
          className="edit-value-input"
          placeholder="Назва"
        />
        <button
          onClick={() => onSave(newValue, newDisplayName)}
          className="edit-value-btn edit-value-btn-save"
        >
          ✓
        </button>
        <button
          onClick={onCancel}
          className="edit-value-btn edit-value-btn-cancel"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className="attribute-manager">
      <h2>Управління атрибутами</h2>

      {/* Створення атрибуту */}
      <div className="form-section">
        <h3>Створити новий атрибут</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Назва атрибуту:</label>
            <input
              type="text"
              value={attributeForm.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Марка автомобіля"
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label>Slug (для API):</label>
            <input
              type="text"
              value={attributeForm.slug}
              onChange={(e) => setAttributeForm(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="brand"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Тип атрибуту:</label>
            <select
              value={attributeForm.type}
              onChange={(e) => setAttributeForm(prev => ({ ...prev, type: e.target.value }))}
              className="form-input"
            >
              <option value="SELECT">Список (SELECT)</option>
              <option value="TEXT">Текст (TEXT)</option>
              <option value="NUMBER">Число (NUMBER)</option>
              <option value="RANGE">Діапазон (RANGE)</option>
              <option value="BOOLEAN">Так/Ні (BOOLEAN)</option>
            </select>
          </div>

          {/* Залежність від іншого атрибуту */}
          <div className="form-group">
            <label>Залежить від атрибуту:</label>
            <select
              value={attributeForm.dependsOn || ''}
              onChange={(e) => setAttributeForm(prev => ({ 
                ...prev, 
                dependsOn: e.target.value ? parseInt(e.target.value) : null 
              }))}
              className="form-input"
            >
              <option value="">Немає залежності</option>
              {attributes
                .filter(attr => attr.type === 'SELECT')
                .map(attr => (
                  <option key={attr.id} value={attr.id}>
                    {attr.name} ({attr.slug})
                  </option>
                ))}
            </select>
            <small className="form-hint">
              Наприклад: "Модель" залежить від "Марка"
            </small>
          </div>

          {(attributeForm.type === 'NUMBER' || attributeForm.type === 'RANGE') && (
            <div className="form-group">
              <label>Одиниця виміру:</label>
              <input
                type="text"
                value={attributeForm.unit}
                onChange={(e) => setAttributeForm(prev => ({ ...prev, unit: e.target.value }))}
                placeholder="км, л, к.с."
                className="form-input"
              />
            </div>
          )}

          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={attributeForm.isFilterable}
                onChange={(e) => setAttributeForm(prev => ({ ...prev, isFilterable: e.target.checked }))}
              />
              Використовувати як фільтр
            </label>
            
            <label>
              <input
                type="checkbox"
                checked={attributeForm.isRequired}
                onChange={(e) => setAttributeForm(prev => ({ ...prev, isRequired: e.target.checked }))}
              />
              Обов'язковий
            </label>
          </div>

          <button 
            onClick={handleCreateAttribute}
            className="btn btn-primary"
          >
            Створити атрибут
          </button>
        </div>
      </div>

      {/* Додавання значень до SELECT атрибутів */}
      <div className="form-section">
        <h3>Додати значення до атрибуту</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Атрибут:</label>
            <select
              value={valueForm.attributeId}
              onChange={(e) => setValueForm(prev => ({ ...prev, attributeId: e.target.value }))}
              className="form-input"
            >
              <option value="">Оберіть атрибут</option>
              {attributes.filter(attr => attr.type === 'SELECT').map(attr => (
                <option key={attr.id} value={attr.id}>{attr.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Значення:</label>
            <input
              type="text"
              value={valueForm.value}
              onChange={(e) => setValueForm(prev => ({ ...prev, value: e.target.value }))}
              placeholder="BMW"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Відображувана назва (опціонально):</label>
            <input
              type="text"
              value={valueForm.displayName}
              onChange={(e) => setValueForm(prev => ({ ...prev, displayName: e.target.value }))}
              placeholder="БМВ"
              className="form-input"
            />
          </div>

          <button 
            onClick={handleAddValue}
            className="btn btn-success"
          >
            Додати значення
          </button>
        </div>
      </div>

      {/* Прив'язка до категорії */}
      <div className="form-section">
        <h3>Прив'язати атрибут до категорії</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Категорія:</label>
            <select
              value={assignForm.categoryId}
              onChange={(e) => setAssignForm(prev => ({ ...prev, categoryId: e.target.value }))}
              className="form-input"
            >
              <option value="">Оберіть категорію</option>
              {flatCategories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {'-'.repeat(cat.level)} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Атрибут:</label>
            <select
              value={assignForm.attributeId}
              onChange={(e) => setAssignForm(prev => ({ ...prev, attributeId: e.target.value }))}
              className="form-input"
            >
              <option value="">Оберіть атрибут</option>
              {attributes.map(attr => (
                <option key={attr.id} value={attr.id}>{attr.name} ({attr.type})</option>
              ))}
            </select>
          </div>

          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={assignForm.isRequired}
                onChange={(e) => setAssignForm(prev => ({ ...prev, isRequired: e.target.checked }))}
              />
              Обов'язковий для цієї категорії
            </label>
          </div>

          <button 
            onClick={handleAssignToCategory}
            className="btn btn-warning"
          >
            Прив'язати
          </button>
        </div>
      </div>

      {/* Список атрибутів */}
      <div className="attributes-list">
        <h3 className='text-label'>Існуючі атрибути</h3>
        {loading ? (
          <p>Завантаження...</p>
        ) : (
          <div className="attributes-grid">
            {attributes.map((attr, index) => (
              <div key={attr.id}>
                {editingAttribute === attr.id ? (
                  <AttributeEditForm attr={attr} />
                ) : (
                  <div className={`attribute-card ${attr.dependsOn ? 'dependent-attribute' : ''}`}>
                    <div className="attribute-header">
                      <div className="attribute-title-section">
                        {/* Кнопки сортування */}
                        <div className="sort-buttons">
                          <button
                            onClick={() => moveAttribute(attr.id, 'up')}
                            disabled={index === 0}
                            className={`sort-btn ${index === 0 ? 'disabled' : ''}`}
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => moveAttribute(attr.id, 'down')}
                            disabled={index === attributes.length - 1}
                            className={`sort-btn ${index === attributes.length - 1 ? 'disabled' : ''}`}
                          >
                            ▼
                          </button>
                        </div>
                        
                        <div>
                          <h4 className="attribute-title">
                            #{attr.displayOrder || (index + 1)} {attr.name}
                          </h4>
                          {/* Відображення залежності */}
                          {attr.dependsOn && (
                            <div className="dependency-info">
                              🔗 Залежить від: {attributes.find(a => a.id === attr.dependsOn)?.name || 'Невідомий атрибут'}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="attribute-actions">
                        <span className="tag tag-type">
                          {attr.type}
                        </span>
                        {attr.isFilterable && (
                          <span className="tag tag-filter">
                            ФІЛЬТР
                          </span>
                        )}
                        {attr.isRequired && (
                          <span className="tag tag-required">
                            ОБОВ'ЯЗКОВИЙ
                          </span>
                        )}
                        {attr.dependsOn && (
                          <span className="tag tag-dependent">
                            ЗАЛЕЖНИЙ
                          </span>
                        )}
                        
                        {/* Кнопки дій */}
                        <button
                          onClick={() => setEditingAttribute(attr.id)}
                          className="action-btn edit-btn"
                        >
                          ✏️ Редагувати
                        </button>
                        <button
                          onClick={() => handleDeleteAttribute(attr.id)}
                          className="action-btn delete-btn"
                        >
                          🗑️ Видалити
                        </button>
                      </div>
                    </div>
                    
                    <div className="attribute-details">
                      <strong>Slug:</strong> {attr.slug}
                      {attr.unit && (
                        <span className="unit-info">
                          <strong>Одиниця:</strong> {attr.unit}
                        </span>
                      )}
                    </div>

                    {attr.type === 'SELECT' && attr.attributeValues && attr.attributeValues.length > 0 && (
                      <div className="attribute-values">
                        <strong>Значення:</strong>
                        <div className="values-list">
                          {attr.attributeValues.map((value, valueIndex) => (
                            <span key={value.id} className="value-item">
                              {editingValue === value.id ? (
                                <EditValueForm 
                                  value={value} 
                                  onSave={(newValue, newDisplayName) => {
                                    handleUpdateValue(value.id, newValue, newDisplayName);
                                  }}
                                  onCancel={() => setEditingValue(null)}
                                />
                              ) : (
                                <>
                                  {/* Кнопки сортування для значень */}
                                  <div className="value-sort-buttons">
                                    <button
                                      onClick={() => moveAttributeValue(attr.id, value.id, 'up')}
                                      disabled={valueIndex === 0}
                                      className={`value-sort-btn ${valueIndex === 0 ? 'disabled' : ''}`}
                                    >
                                      ▲
                                    </button>
                                    <button
                                      onClick={() => moveAttributeValue(attr.id, value.id, 'down')}
                                      disabled={valueIndex === attr.attributeValues.length - 1}
                                      className={`value-sort-btn ${valueIndex === attr.attributeValues.length - 1 ? 'disabled' : ''}`}
                                    >
                                      ▼
                                    </button>
                                  </div>
                                  
                                  <span>#{value.displayOrder || (valueIndex + 1)} {value.displayName || value.value}</span>
                                  
                                  <button
                                    onClick={() => setEditingValue(value.id)}
                                    className="value-action-btn value-edit-btn"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={() => handleDeleteValue(value.id)}
                                    className="value-action-btn value-delete-btn"
                                  >
                                    ❌
                                  </button>
                                </>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {attr.categoryAttributes && attr.categoryAttributes.length > 0 && (
                      <div className="category-assignments">
                        <strong>Використовується в категоріях:</strong>
                        <div className="category-list">
                          {attr.categoryAttributes.map(catAttr => (
                            <span key={catAttr.id} className="category-item">
                              {catAttr.category.name}
                              {catAttr.isRequired && ' (обов\'язковий)'}
                              <button
                                onClick={() => handleUnassignFromCategory(catAttr.categoryId, catAttr.attributeId)}
                                className="category-unassign-btn"
                              >
                                ❌
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}