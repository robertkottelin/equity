// components/Summary.js
import React from 'react';
import './Summary.css';

const Summary = ({ totalValue, sectorSummary, isSubscribed }) => {
  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  // Format percentage values
  const formatPercentage = (value, total) => {
    if (total === 0) return '0.00%';
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / total);
  };

  return (
    <div className="summary-container">
      <h2>Portfolio Summary</h2>
      <div className="summary-content">
        <div className="total-summary">
          <div className={`summary-card ${isSubscribed ? 'premium-card' : ''}`}>
            <h3>Total Portfolio Value</h3>
            <p className="total-value">{formatCurrency(totalValue)}</p>
            {isSubscribed && <span className="premium-badge">PREMIUM</span>}
          </div>
        </div>

        <div className="sector-summary">
          <h3>Asset Allocation</h3>
          {Object.keys(sectorSummary).length === 0 ? (
            <p>No assets added yet.</p>
          ) : (
            <table className="sector-table">
              <thead>
                <tr>
                  <th>Sector Type</th>
                  <th>Count</th>
                  <th>Value</th>
                  <th>Allocation %</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(sectorSummary).map(([sector, data], index) => (
                  <tr key={index}>
                    <td>{sector.charAt(0).toUpperCase() + sector.slice(1)}</td>
                    <td>{data.count}</td>
                    <td>{formatCurrency(data.value)}</td>
                    <td>{formatPercentage(data.value, totalValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {isSubscribed && (
          <div className="analytics-summary">
            <h3>Advanced Analytics</h3>
            <div className="analytics-grid">
              <div className="analytics-card">
                <h4>Portfolio Risk</h4>
                <div className="risk-meter" data-risk="medium">
                  <div className="risk-level"></div>
                </div>
                <p>Medium</p>
              </div>
              <div className="analytics-card">
                <h4>Diversification Score</h4>
                <p className="analytics-value">
                  {(Object.keys(sectorSummary).length / 4 * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Summary;