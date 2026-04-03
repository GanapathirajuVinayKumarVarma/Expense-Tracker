import React, { useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const API_URL = 'http://localhost:3000';

function Modals({ activeModal, closeModal, currentQuickCategory, refreshData, expenses }) {
  if (!activeModal) return null;

  return (
    <>
      {activeModal === 'quickExpense' && (
        <QuickExpenseModal category={currentQuickCategory} onClose={closeModal} onRefresh={refreshData} />
      )}
      {activeModal === 'addCategory' && (
        <AddCategoryModal onClose={closeModal} onRefresh={refreshData} />
      )}
      {activeModal === 'analysis' && (
        <AnalysisModal onClose={closeModal} expenses={expenses} />
      )}
    </>
  );
}

// Quick Expense Modal Component
function QuickExpenseModal({ category, onClose, onRefresh }) {
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSave = async () => {
    if (!amount) {
      alert("Please enter an amount");
      return;
    }
    const payload = {
      category_id: category.id,
      category_name: category.name,
      reason: reason.trim() || "Expense",
      amount: parseFloat(amount),
      date: date || new Date().toISOString()
    };

    try {
        const response = await fetch(`${API_URL}/expenses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if(response.ok) {
            onClose();
            onRefresh();
        }
    } catch (err) {
        console.error("Failed to add:", err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-content">
        <h2 style={{ marginBottom: '24px' }}>Add Expense to {category?.name}</h2>
        <input 
          type="text" 
          placeholder="Reason (e.g. Lunch)" 
          className="input-field" 
          value={reason} 
          onChange={(e) => setReason(e.target.value)} 
        />
        <input 
          type="number" 
          placeholder="₹ Amount" 
          className="input-field" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)} 
        />
        <input 
          type="date" 
          className="input-field" 
          value={date} 
          onChange={(e) => setDate(e.target.value)} 
        />
        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          <button className="btn-clear" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn-primary" style={{ flex: 1 }} onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

// Add Category Modal Component
function AddCategoryModal({ onClose, onRefresh }) {
  const [name, setName] = useState('');

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      alert("Please enter a category name");
      return;
    }

    try {
        const response = await fetch(`${API_URL}/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: trimmed })
        });
        if (response.ok) {
            onClose();
            onRefresh();
        } else {
            const errData = await response.json();
            alert("Failed to add category: " + (errData.error || "Unknown"));
        }
    } catch (err) {
        console.error("Failed to add category:", err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-content">
        <h2 style={{ marginBottom: '24px' }}>Add New Category</h2>
        <input 
          type="text" 
          placeholder="e.g. Travel" 
          className="input-field" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          autoFocus
        />
        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          <button className="btn-clear" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn-primary" style={{ flex: 1 }} onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

// Analysis Modal Component
function AnalysisModal({ onClose, expenses }) {
  const categoryTotals = expenses.reduce((acc, exp) => {
    const cat = exp.category_name || "Unknown";
    acc[cat] = (acc[cat] || 0) + exp.amount;
    return acc;
  }, {});

  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);

  const backgroundColors = [
    'rgba(255, 99, 132, 0.7)',
    'rgba(54, 162, 235, 0.7)',
    'rgba(255, 206, 86, 0.7)',
    'rgba(75, 192, 192, 0.7)',
    'rgba(153, 102, 255, 0.7)',
    'rgba(255, 159, 64, 0.7)'
  ];
  const borderColors = backgroundColors.map(c => c.replace('0.7', '1'));

  ChartJS.defaults.color = '#a0a0b0';

  const chartData = {
    labels: labels.length ? labels : ['No Data'],
    datasets: [{
      label: 'Spending (₹)',
      data: data.length ? data : [0],
      backgroundColor: backgroundColors,
      borderColor: borderColors,
      borderWidth: 1,
      borderRadius: 6
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { grid: { color: 'rgba(255,255,255,0.05)' } },
      x: { grid: { color: 'rgba(255,255,255,0.05)' } }
    }
  };

  const pieData = {
    labels: labels.length ? labels : ['No Data'],
    datasets: [{
      data: data.length ? data : [1],
      backgroundColor: backgroundColors,
      borderColor: borderColors,
      borderWidth: 1,
      hoverOffset: 4
    }]
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#a0a0b0' } }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-content" style={{ maxWidth: '800px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0 }}>Spending Analysis</h2>
          <button className="btn-clear" style={{ border: 'none', padding: '4px 12px', fontSize: '20px' }} onClick={onClose}>✕</button>
        </div>
        <div className="charts-container">
          <div className="chart-wrapper">
            <h3 style={{ marginBottom: '16px', color: '#fff', fontSize: '16px' }}>Spending by Category (Bar)</h3>
            <Bar data={chartData} options={chartOptions} />
          </div>
          <div className="chart-wrapper">
            <h3 style={{ marginBottom: '16px', color: '#fff', fontSize: '16px' }}>Spending Distribution (Pie)</h3>
            <Doughnut data={pieData} options={pieOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Modals;
