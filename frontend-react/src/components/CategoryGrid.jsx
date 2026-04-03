import React from 'react';

function getCategoryEmoji(name) {
  const n = name.toLowerCase();
  if (n.includes('food') || n.includes('eat') || n.includes('meal') || n.includes('lunch') || n.includes('dinner')) return '🍔';
  if (n.includes('entertainment') || n.includes('movie') || n.includes('game') || n.includes('fun')) return '🎬';
  if (n.includes('house') || n.includes('home') || n.includes('rent')) return '🏠';
  if (n.includes('travel') || n.includes('transport') || n.includes('car') || n.includes('bus')) return '🚗';
  if (n.includes('health') || n.includes('medical') || n.includes('doctor')) return '🏥';
  if (n.includes('utility') || n.includes('bill') || n.includes('electricity')) return '💡';
  return '🏷️';
}

function CategoryGrid({ categories, onAddCategory, onCategoryClick, onDeleteCategory }) {
  return (
    <div className="grid-container" id="category-grid">
      {categories.map((cat) => {
        const emoji = getCategoryEmoji(cat.name);
        return (
          <div key={cat.id} className="category-item-wrapper" style={{ position: 'relative' }}>
            <button
              className="category-btn glass-panel"
              onClick={() => onCategoryClick(cat)}
            >
              <span style={{ fontSize: '32px' }}>{emoji}</span>
              <span>{cat.name}</span>
            </button>
            <button
              title="Delete Category"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteCategory(cat.id, cat.name);
              }}
              style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#ff4d4d',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
              }}
            >
              ✕
            </button>
          </div>
        );
      })}

      <div className="category-item-wrapper">
        <button
          className="category-btn glass-panel"
          style={{ borderStyle: 'dashed', background: 'rgba(255,255,255,0.02)' }}
          onClick={onAddCategory}
        >
          <span style={{ fontSize: '32px' }}>➕</span>
          <span>New Category</span>
        </button>
      </div>
    </div>
  );
}

export default CategoryGrid;
