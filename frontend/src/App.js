import React, { useState, useEffect } from 'react';
import './App.css';
import AssetTable from './components/AssetTable';
import AssetForm from './components/AssetForm';
import Summary from './components/Summary';
import * as assetService from './services/assetService';

function App() {
  const [assets, setAssets] = useState([]);
  const [isAddingAsset, setIsAddingAsset] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load assets from storage on component mount
  useEffect(() => {
    const loadAssets = () => {
      const storedAssets = assetService.getAssets();
      setAssets(storedAssets);
      setIsLoading(false);
    };
    
    loadAssets();
  }, []);

  // Add a new asset to the list
  const handleAddAsset = (asset) => {
    if (editingAsset !== null) {
      // Update existing asset
      const updatedAssets = assetService.updateAsset(editingAsset, asset);
      if (updatedAssets) {
        setAssets(updatedAssets);
      }
      setEditingAsset(null);
    } else {
      // Add new asset
      const updatedAssets = assetService.addAsset(asset);
      if (updatedAssets) {
        setAssets(updatedAssets);
      }
    }
    setIsAddingAsset(false);
  };

  // Start editing an asset
  const handleEditAsset = (index) => {
    setEditingAsset(index);
    setIsAddingAsset(true);
  };

  // Delete an asset from the list
  const handleDeleteAsset = (index) => {
    const updatedAssets = assetService.deleteAsset(index);
    if (updatedAssets) {
      setAssets(updatedAssets);
    }
  };

  // Calculate the total value of all assets
  const calculateTotalValue = () => {
    return assets.reduce((total, asset) => total + asset.value, 0);
  };

  // Group assets by sector type for summary
  const getAssetsBySector = () => {
    return assets.reduce((groups, asset) => {
      const sectorType = asset.sectorType;
      if (!groups[sectorType]) {
        groups[sectorType] = { count: 0, value: 0 };
      }
      groups[sectorType].count += 1;
      groups[sectorType].value += asset.value;
      return groups;
    }, {});
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Equity Management Tool</h1>
      </header>
      <main className="App-main">
        <div className="actions">
          <button 
            className="btn btn-primary" 
            onClick={() => {
              setIsAddingAsset(true);
              setEditingAsset(null);
            }}
          >
            Add New Asset
          </button>
        </div>
        
        {isAddingAsset && (
          <AssetForm 
            onAddAsset={handleAddAsset} 
            onCancel={() => {
              setIsAddingAsset(false);
              setEditingAsset(null);
            }}
            editingAsset={editingAsset !== null ? assets[editingAsset] : null}
          />
        )}

        <Summary 
          totalValue={calculateTotalValue()}
          sectorSummary={getAssetsBySector()}
        />

        <AssetTable 
          assets={assets}
          onEdit={handleEditAsset}
          onDelete={handleDeleteAsset}
        />
      </main>
    </div>
  );
}

export default App;