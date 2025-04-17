// components/AssetTable.js
import React from 'react';
import './AssetTable.css';

const AssetTable = ({ assets, onEdit, onDelete, isSubscribed }) => {
  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  // Format percentage values
  const formatPercentage = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100);
  };

  return (
    <div className="asset-table-container">
      <h2>Asset Portfolio</h2>
      {assets.length === 0 ? (
        <p>No assets added yet. Use the "Add New Asset" button to get started.</p>
      ) : (
        <table className="asset-table">
          <thead>
            <tr>
              <th>Sector Type</th>
              <th>Sub-Sector</th> {/* New column for sub-sector */}
              <th>Name</th>
              <th>Price</th>
              <th>Acquisition Price</th>
              <th>Profit/Loss</th>
              <th>Profit/Loss %</th>
              <th>Amount</th>
              <th>Value</th>
              <th>P/E</th>
              <th>Dividend Yield %</th>
              <th>1Y Growth %</th>
              <th>3Y Growth %</th>
              <th>5Y Growth %</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset, index) => (
              <tr key={index} className={isSubscribed ? "premium-row" : ""}>
                <td>{asset.sectorType}</td>
                <td>{asset.subSector || 'N/A'}</td> {/* Display sub-sector with fallback */}
                <td>{asset.name}</td>
                <td>{formatCurrency(asset.price)}</td>
                <td>{formatCurrency(asset.acquisitionPrice)}</td>
                <td className={asset.profitLoss >= 0 ? "positive" : "negative"}>
                  {formatCurrency(asset.profitLoss)}
                </td>
                <td className={asset.profitLossPercentage >= 0 ? "positive" : "negative"}>
                  {formatPercentage(asset.profitLossPercentage)}
                </td>
                <td>{asset.amount}</td>
                <td>{formatCurrency(asset.value)}</td>
                <td>{asset.pe || 'N/A'}</td>
                <td>{asset.dividendYield ? formatPercentage(asset.dividendYield) : 'N/A'}</td>
                <td>{asset.growth1y ? formatPercentage(asset.growth1y) : 'N/A'}</td>
                <td>{asset.growth3y ? formatPercentage(asset.growth3y) : 'N/A'}</td>
                <td>{asset.growth5y ? formatPercentage(asset.growth5y) : 'N/A'}</td>
                <td>
                  <button 
                    className="btn btn-edit" 
                    onClick={() => onEdit(index)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-delete" 
                    onClick={() => onDelete(index)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!isSubscribed && assets.length > 0 && (
        <div className="subscription-upsell">
          <p>Upgrade to premium for enhanced analytics and unlimited assets!</p>
        </div>
      )}
    </div>
  );
};

export default AssetTable;