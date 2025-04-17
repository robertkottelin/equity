import React, { useState, useEffect } from 'react';
import './AssetForm.css';

const AssetForm = ({ onAddAsset, onCancel, editingAsset }) => {
  const initialFormState = {
    sectorType: 'equity',
    subSector: '',  // New sub-sector field initialized as empty string
    name: '',
    price: 0,
    acquisitionPrice: 0,
    amount: 0,
    pe: '',
    dividendYield: '',
    growth1y: '',
    growth3y: '',
    growth5y: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  
  // Sub-sector suggestions based on sector type selection
  const subSectorSuggestions = {
    equity: ['Technology', 'Healthcare', 'Consumer Goods', 'Financial Services', 'Energy', 'Telecommunications', 'Utilities', 'Real Estate', 'Industrial', 'Materials'],
    fund: ['Index Fund', 'ETF', 'Mutual Fund', 'Bond Fund', 'Money Market', 'REIT', 'Sector Fund', 'International Fund', 'Balanced Fund', 'Dividend Fund'],
    cash: ['Savings', 'Checking', 'Certificate of Deposit', 'Money Market Account', 'Treasury Bills', 'Currency'],
    others: ['Commodities', 'Cryptocurrency', 'Derivatives', 'Private Equity', 'Collectibles', 'Precious Metals', 'Options', 'Futures']
  };

  // If editing an existing asset, populate the form with its data
  useEffect(() => {
    if (editingAsset) {
      setFormData(editingAsset);
    }
  }, [editingAsset]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Convert numeric inputs to numbers or null for empty strings
    if ([
        'price',
        'acquisitionPrice',
        'amount',
        'pe',
        'dividendYield',
        'growth1y',
        'growth3y',
        'growth5y',
    ].includes(name)) {
        // Convert empty string to null for optional fields
        processedValue = value === '' ? null : Number(value);
    }
    
    setFormData({
        ...formData,
        [name]: processedValue,
    });
  };

  // Calculate derived values
  const calculateDerivedValues = () => {
    const price = parseFloat(formData.price);
    const acquisitionPrice = parseFloat(formData.acquisitionPrice);
    const amount = parseInt(formData.amount, 10);

    // Calculate value
    const value = price * amount;

    // Calculate profit/loss
    const profitLoss = (price - acquisitionPrice) * amount;

    // Calculate profit/loss percentage
    const profitLossPercentage = 
      acquisitionPrice > 0 
        ? ((price - acquisitionPrice) / acquisitionPrice) * 100 
        : 0;

    return {
      ...formData,
      value,
      profitLoss,
      profitLossPercentage,
    };
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const assetWithCalculations = calculateDerivedValues();
    onAddAsset(assetWithCalculations);
    setFormData(initialFormState);
  };

  return (
    <div className="asset-form-container">
      <h2>{editingAsset ? 'Edit Asset' : 'Add New Asset'}</h2>
      <form onSubmit={handleSubmit} className="asset-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="sectorType">Sector Type:</label>
            <select
              id="sectorType"
              name="sectorType"
              value={formData.sectorType}
              onChange={handleChange}
              required
            >
              <option value="equity">Equity</option>
              <option value="fund">Fund</option>
              <option value="cash">Cash</option>
              <option value="others">Others</option>
            </select>
          </div>
          
          {/* New Sub-Sector Field */}
          <div className="form-group">
            <label htmlFor="subSector">Sub-Sector (Optional):</label>
            <input
              type="text"
              list="subSectorSuggestions"
              id="subSector"
              name="subSector"
              value={formData.subSector || ''}
              onChange={handleChange}
              placeholder="e.g., Technology, Healthcare"
            />
            <datalist id="subSectorSuggestions">
              {subSectorSuggestions[formData.sectorType]?.map((suggestion, index) => (
                <option key={index} value={suggestion} />
              ))}
            </datalist>
          </div>

          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price">Current Price:</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="acquisitionPrice">Acquisition Price:</label>
            <input
              type="number"
              id="acquisitionPrice"
              name="acquisitionPrice"
              value={formData.acquisitionPrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount (pcs):</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              min="0"
              step="1"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="pe">P/E Ratio:</label>
            <input
              type="number"
              id="pe"
              name="pe"
              value={formData.pe}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="Optional"
            />
          </div>

          <div className="form-group">
            <label htmlFor="dividendYield">Dividend Yield (%):</label>
            <input
              type="number"
              id="dividendYield"
              name="dividendYield"
              value={formData.dividendYield}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="growth1y">1Y Growth (%):</label>
            <input
              type="number"
              id="growth1y"
              name="growth1y"
              value={formData.growth1y}
              onChange={handleChange}
              step="0.01"
              placeholder="Optional"
            />
          </div>

          <div className="form-group">
            <label htmlFor="growth3y">3Y Growth (%):</label>
            <input
              type="number"
              id="growth3y"
              name="growth3y"
              value={formData.growth3y}
              onChange={handleChange}
              step="0.01"
              placeholder="Optional"
            />
          </div>

          <div className="form-group">
            <label htmlFor="growth5y">5Y Growth (%):</label>
            <input
              type="number"
              id="growth5y"
              name="growth5y"
              value={formData.growth5y}
              onChange={handleChange}
              step="0.01"
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-submit">
            {editingAsset ? 'Update Asset' : 'Add Asset'}
          </button>
          <button type="button" className="btn btn-cancel" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssetForm;