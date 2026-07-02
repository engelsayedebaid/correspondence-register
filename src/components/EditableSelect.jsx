import { useState, useRef, useEffect } from 'react';

function EditableSelect({ value, onChange, options, onOptionsChange, placeholder, label, error }) {
  const [isOpen, setIsOpen] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setShowAddInput(false);
        setNewItem('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus the add input when shown
  useEffect(() => {
    if (showAddInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showAddInput]);

  const handleSelect = (item) => {
    onChange(item);
    setIsOpen(false);
  };

  const handleAdd = () => {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    if (options.includes(trimmed)) {
      setNewItem('');
      return;
    }
    onOptionsChange([...options, trimmed]);
    onChange(trimmed);
    setNewItem('');
    setShowAddInput(false);
    setIsOpen(false);
  };

  const handleDelete = (e, item) => {
    e.stopPropagation();
    const updated = options.filter((o) => o !== item);
    onOptionsChange(updated);
    if (value === item) {
      onChange('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
    if (e.key === 'Escape') {
      setShowAddInput(false);
      setNewItem('');
    }
  };

  const selectedLabel = value || placeholder || 'اختر...';

  return (
    <div className="editable-select" ref={containerRef}>
      {label && <label className="form-label">{label}</label>}

      {/* Trigger button */}
      <button
        type="button"
        className={`editable-select-trigger ${error ? 'has-error' : ''} ${isOpen ? 'is-open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? 'selected-text' : 'placeholder-text'}>
          {selectedLabel}
        </span>
        <svg
          className={`chevron ${isOpen ? 'rotated' : ''}`}
          width="12" height="12" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="editable-select-dropdown">
          {/* Options list */}
          <div className="editable-select-list">
            {options.length === 0 ? (
              <div className="editable-select-empty">لا توجد عناصر</div>
            ) : (
              options.map((item) => (
                <div
                  key={item}
                  className={`editable-select-option ${value === item ? 'is-selected' : ''}`}
                  onClick={() => handleSelect(item)}
                >
                  <span className="option-text">{item}</span>
                  <button
                    type="button"
                    className="option-delete-btn"
                    onClick={(e) => handleDelete(e, item)}
                    title="حذف"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add new item section */}
          <div className="editable-select-footer">
            {showAddInput ? (
              <div className="add-item-row">
                <input
                  ref={inputRef}
                  type="text"
                  className="add-item-input"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="أدخل اسم العنصر الجديد..."
                />
                <button
                  type="button"
                  className="add-item-confirm"
                  onClick={handleAdd}
                  disabled={!newItem.trim()}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="add-item-cancel"
                  onClick={() => { setShowAddInput(false); setNewItem(''); }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="add-new-btn"
                onClick={() => setShowAddInput(true)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                إضافة عنصر جديد
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default EditableSelect;
