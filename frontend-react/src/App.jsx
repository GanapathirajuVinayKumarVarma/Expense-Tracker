import React, { useState, useEffect } from 'react';
import './index.css';
import DashboardHeader from './components/DashboardHeader';
import CategoryGrid from './components/CategoryGrid';
import ExpenseList from './components/ExpenseList';
import Modals from './components/Modals';
const API_URL = 'http://localhost:3000';
function App() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeModal, setActiveModal] = useState(null); // 'quickExpense', 'addCategory', 'analysis'
  const [currentQuickCategory, setCurrentQuickCategory] = useState(null);
  const initData = async () => {
    try {
      const [expRes, catRes] = await Promise.all([
        fetch(`${API_URL}/expenses`),
        fetch(`${API_URL}/categories`)
      ]);
      setExpenses(await expRes.json());
      setCategories(await catRes.json());
    } catch (err) {
      console.error("Error fetching data:", err);
      // alert("Failed to connect to backend server. Make sure node server.js is running!");
    }
  };
  useEffect(() => {
    initData();
  }, []);
  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const categoryTotals = expenses.reduce((acc, exp) => {
    const cat = exp.category_name || "Unknown";
    acc[cat] = (acc[cat] || 0) + exp.amount;
    return acc;
  }, {});
  let highestCategory = { name: 'None', amount: 0 };
  for (const [cat, amount] of Object.entries(categoryTotals)) {
    if (amount > highestCategory.amount) {
      highestCategory = { name: cat, amount: amount };
    }
  }
  const clearAll = async () => {
    if (confirm('Are you sure you want to clear ALL expenses permanently?')) {
      try {
        await fetch(`${API_URL}/expenses`, { method: 'DELETE' });
        await initData();
      } catch (err) {
        console.error("Failed to clear:", err);
      }
    }
  };
  const deleteExpense = async (id) => {
    if (confirm('Delete this expense?')) {
      try {
        await fetch(`${API_URL}/expenses/${id}`, { method: 'DELETE' });
        await initData();
      } catch (err) {
        console.error("Failed to delete:", err);
      }
    }
  };
  const deleteCategory = async (id, name) => {
    if (confirm(`Are you sure you want to delete the category "${name}"? This will also delete all associated expenses.`)) {
      try {
        const response = await fetch(`${API_URL}/categories/${id}`, { method: 'DELETE' });
        if (response.ok) {
          await initData();
        } else {
          alert("Failed to delete category");
        }
      } catch (err) {
        console.error("Failed to delete category:", err);
      }
    }
  };
  return (
    <div id="root">
      <h1 className="page-title">💸 Expense Tracker</h1>
      {/* Summary */}
      <div className="glass-panel summary-panel">
        <div className="text-left">
          <div className="stat-label">Total Monthly Spending</div>
          <div className="stat-value">₹ {totalAmount.toFixed(2)}</div>
        </div>
        <div className="text-right">
          <div className="stat-label">Highest Spending</div>
          <div className="spending-badge">
            {highestCategory.amount > 0 ? `🔥 ${highestCategory.name} (₹${highestCategory.amount})` : 'None'}
          </div>
        </div>
      </div>

      <div className="glass-panel dashboard-panel">
        <DashboardHeader 
          onClearAll={clearAll} 
          onShowAnalysis={() => setActiveModal('analysis')} 
        />

        {/* Category Grid */}
        <h3 className="section-header" style={{ marginTop: 0, marginBottom: '16px' }}>Categories (Click to add expense)</h3>
        <CategoryGrid 
          categories={categories} 
          onAddCategory={() => setActiveModal('addCategory')}
          onCategoryClick={(cat) => {
            setCurrentQuickCategory(cat);
            setActiveModal('quickExpense');
          }}
          onDeleteCategory={deleteCategory}
        />

        {/* Expenses List */}
        <h3 className="section-header">Recent Expenses (Grouped)</h3>
        <ExpenseList expenses={expenses} onDeleteExpense={deleteExpense} />
      </div>

      <Modals 
        activeModal={activeModal}
        closeModal={() => setActiveModal(null)}
        currentQuickCategory={currentQuickCategory}
        refreshData={initData}
        expenses={expenses}
      />
    </div>
  );
}

export default App;
