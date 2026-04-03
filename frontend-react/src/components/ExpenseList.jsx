import React from 'react';

function ExpenseList({ expenses, onDeleteExpense }) {
  if (!expenses || expenses.length === 0) {
    return <div style={{ textAlign: 'left', color: 'var(--text-muted)' }}>No expenses yet.</div>;
  }

  // Group expenses by category_name
  const grouped = expenses.reduce((acc, exp) => {
    const cat = exp.category_name || "Unknown";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(exp);
    return acc;
  }, {});

  return (
    <div id="expenses-container" className="expenses-list-container">
      {Object.entries(grouped).map(([category, items]) => {
        const groupTotal = items.reduce((sum, item) => sum + item.amount, 0);

        return (
          <div key={category} className="expense-group">
            <h4 className="group-header">
              {category}
              <span className="group-total">₹{groupTotal.toFixed(2)}</span>
            </h4>

            {items.map(item => {
              const displayDate = new Date(item.date).toLocaleDateString();

              return (
                <div key={item.id} className="glass-panel expense-item">
                  <div className="expense-info">
                    <div className="expense-title">{item.reason}</div>
                    <div className="expense-date">{displayDate}</div>
                  </div>
                  <div className="expense-amount-wrapper">
                    <span className="expense-amount">₹{item.amount.toFixed(2)}</span>
                    <div className="btn-group">
                      <button
                        onClick={() => onDeleteExpense(item.id)}
                        style={{
                          background: 'rgba(255,100,100,0.1)',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6.4px',
                          cursor: 'pointer'
                        }}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default ExpenseList;
