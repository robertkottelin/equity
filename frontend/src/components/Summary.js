import React from 'react';
import './Summary.css';

const Summary = ({ totalValue, sectorSummary }) => {
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
          <div className="summary-card">
            <h3>Total Portfolio Value</h3>
            <p className="total-value">{formatCurrency(totalValue)}</p>
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
      </div>
    </div>
  );
};

export default Summary;