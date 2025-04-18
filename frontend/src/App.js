import React, { useState, useEffect, useContext } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import './App.css';
import AssetTable from './components/AssetTable';
import AssetForm from './components/AssetForm';
import Summary from './components/Summary';
import AuthModal from './components/auth/AuthModal';
import SubscriptionForm from './components/auth/SubscriptionForm';
import { AuthContext } from './contexts/AuthContext';
import { AssetService, SubscriptionService } from './services/api';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe('pk_test_kbl0ETzPsoiTwU4ZJMvhsYJw006XVnV4Aq');

function App() {
  const { isAuthenticated, isSubscribed, isLoading: authLoading, currentUser, logout } = useContext(AuthContext);
  
  const [assets, setAssets] = useState([]);
  const [isAddingAsset, setIsAddingAsset] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isCancellingSubscription, setIsCancellingSubscription] = useState(false);
  
  // Load assets from API on component mount
  useEffect(() => {
    const loadAssets = async () => {
      if (isAuthenticated) {
        try {
          const fetchedAssets = await AssetService.getAssets();
          setAssets(fetchedAssets);
        } catch (error) {
          console.error("Error loading assets:", error);
          // Security fix: No fallback to localStorage for authenticated users
          setAssets([]);
        }
      } else {
        // Security fix: Non-authenticated users start with empty assets
        setAssets([]);
      }
      setIsLoading(false);
    };
    
    if (!authLoading) {
      loadAssets();
    }
  }, [isAuthenticated, authLoading]);

  // Add a new asset to the list
  const handleAddAsset = async (asset) => {
    if (isAuthenticated) {
      try {
        if (editingAsset !== null) {
          // Update existing asset via API
          const updatedAsset = await AssetService.updateAsset(asset.id, asset);
          setAssets(assets.map(a => a.id === updatedAsset.id ? updatedAsset : a));
        } else {
          // Add new asset via API
          const newAsset = await AssetService.addAsset(asset);
          setAssets([...assets, newAsset]);
        }
      } catch (error) {
        console.error("Error saving asset:", error);
        // Security fix: Remove fallback to localStorage, show error instead
        alert("Unable to save asset. Please try again.");
      }
    } else {
      // Security fix: For unauthenticated users, keep assets in memory only
      // and prompt for authentication
      if (editingAsset !== null) {
        const updatedAssets = assets.map((item, index) => 
          index === editingAsset ? asset : item
        );
        setAssets(updatedAssets);
      } else {
        const newAsset = {
          ...asset,
          id: `temp_${Date.now()}` // Temporary ID
        };
        setAssets([...assets, newAsset]);
      }
      
      // Prompt user to login to save their data
      setTimeout(() => {
        alert("Your changes will be lost when you close the browser. Please login to save your data.");
      }, 500);
    }
    
    setEditingAsset(null);
    setIsAddingAsset(false);
  };

  // Start editing an asset
  const handleEditAsset = (index) => {
    setEditingAsset(index);
    setIsAddingAsset(true);
  };

  // Delete an asset from the list
  const handleDeleteAsset = async (index) => {
    if (isAuthenticated) {
      try {
        const assetId = assets[index].id;
        await AssetService.deleteAsset(assetId);
        setAssets(assets.filter((_, i) => i !== index));
      } catch (error) {
        console.error("Error deleting asset:", error);
        // Security fix: No fallback to localStorage, show error instead
        alert("Unable to delete asset. Please try again.");
      }
    } else {
      // For non-authenticated users, just update in-memory state
      const updatedAssets = assets.filter((_, i) => i !== index);
      setAssets(updatedAssets);
    }
  };
  
  // Handle user logout
  const handleLogout = async () => {
    await logout();
    // Security fix: Reset assets to empty array after logout
    setAssets([]);
  };
  
  // Handle subscription cancellation
  const handleCancelSubscription = async () => {
    if (!isAuthenticated || !isSubscribed) return;
    
    const confirmed = window.confirm("Are you sure you want to cancel your subscription? This action cannot be undone.");
    if (!confirmed) return;
    
    setIsCancellingSubscription(true);
    
    try {
      const result = await SubscriptionService.cancelSubscription();
      if (result) {
        alert("Your subscription has been canceled successfully.");
        window.location.reload(); // Refresh to update subscription status
      }
    } catch (error) {
      console.error("Error canceling subscription:", error);
      alert("Failed to cancel subscription. Please try again.");
    } finally {
      setIsCancellingSubscription(false);
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

  // Show loading state while authentication is being determined
  if (authLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Equity Management Tool</h1>
        <div className="user-controls">
          {isAuthenticated ? (
            <div className="user-info">
              <span>Welcome, {currentUser?.email}</span>
              <button 
                className="btn btn-logout"
                onClick={handleLogout}
              >
                Logout
              </button>
              {isSubscribed && (
                <button 
                  className="btn btn-cancel-subscription"
                  onClick={handleCancelSubscription}
                  disabled={isCancellingSubscription}
                >
                  {isCancellingSubscription ? 'Cancelling...' : 'Cancel Subscription'}
                </button>
              )}
            </div>
          ) : (
            <button 
              className="btn btn-login"
              onClick={() => setShowAuthModal(true)}
            >
              Login / Register
            </button>
          )}
        </div>
      </header>
      
      <main className="App-main">
        {/* Subscription banner for non-subscribed users */}
        {isAuthenticated && !isSubscribed && (
          <div className="subscription-banner">
            <Elements stripe={stripePromise}>
              <SubscriptionForm 
                onSuccess={() => window.location.reload()}
              />
            </Elements>
          </div>
        )}
        
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
          isSubscribed={isSubscribed}
        />

        <AssetTable 
          assets={assets}
          onEdit={handleEditAsset}
          onDelete={handleDeleteAsset}
          isSubscribed={isSubscribed}
        />
        
        {!isAuthenticated && assets.length > 0 && (
          <div className="login-reminder">
            <p>Sign in to save your portfolio and access it from anywhere!</p>
            <button 
              className="btn btn-reminder" 
              onClick={() => setShowAuthModal(true)}
            >
              Login / Register
            </button>
          </div>
        )}
      </main>
      
      {/* Authentication Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
}

export default App;