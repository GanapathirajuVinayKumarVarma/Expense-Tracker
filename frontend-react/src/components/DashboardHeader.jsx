import React from 'react';
function DashboardHeader({ onClearAll, onShowAnalysis }) {
  return (
    <div className="dashboard-header">
      <h2>Dashboard</h2>
      <div className="btn-group">
        <button 
          className="btn-primary" 
          style={{ padding: '8px 16px', fontSize: '14.4px', boxShadow: 'none' }}
          onClick={onShowAnalysis}
        >
          📊 Show Analysis
        </button>
        <button className="btn-clear" onClick={onClearAll}>
          Clear All
        </button>
      </div>
    </div>
  );
}
export default DashboardHeader;
