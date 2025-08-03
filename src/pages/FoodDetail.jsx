import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getFoodDetails } from "../lib/api"; // or adjust path if needed
import { useNotification } from "../contexts/NotificationContext";

import orangeJuiceImage from '../assets/orange_juice.webp';
import upAndGoImage from '../assets/Up_and_Go.jpeg';

function FoodDetail() {
  const { id } = useParams(); // pulls the "id" from the URL
  const navigate = useNavigate();
  const { triggerNewMessage } = useNotification();
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [foodItem, setFoodItem] = useState(null);
  const [userItems, setUserItems] = useState([]);

  useEffect(() => {
    const data = getFoodDetails(parseInt(id)); // look up by ID
    setFoodItem(data);
  }, [id]);

  // Load user's inventory from localStorage
  useEffect(() => {
    loadUserInventory();
  }, []);

  const loadUserInventory = () => {
    const items = [];
    
    // Scan localStorage for food items
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('food-image-')) {
        const itemId = key.replace('food-image-', '');
        const imageData = localStorage.getItem(key);
        const nameData = localStorage.getItem(`food-name-${itemId}`);
        
        if (imageData && nameData) {
          items.push({
            id: itemId,
            name: nameData,
            image: imageData, // This is base64 data
            timestamp: parseInt(itemId)
          });
        }
      }
    }
    
    // Sort by timestamp (newest first)
    items.sort((a, b) => b.timestamp - a.timestamp);
    setUserItems(items);
  };

  const handleTradeClick = () => {
    setShowTradeModal(true);
    setSelectedItems([]); // Reset selection when opening modal
  };

  const closeModal = () => {
    setShowTradeModal(false);
  };

  const handleItemSelect = (item) => {
    setSelectedItems(prev => {
      const isSelected = prev.find(selected => selected.id === item.id);
      
      if (isSelected) {
        // Remove item if already selected
        return prev.filter(selected => selected.id !== item.id);
      } else {
        // Add item (no limit)
        return [...prev, item];
      }
    });
  };

  const handleConfirmTrade = () => {
    console.log('Selected items for trade:', selectedItems);
    alert(`Trade offer sent with ${selectedItems.length} item(s)!`);
    setShowTradeModal(false);
    setSelectedItems([]);
    // Trigger notification and redirect to home page
    console.log('Triggering new message notification...');
    triggerNewMessage();
    navigate('/');
  };

  const getItemSelectionNumber = (itemId) => {
    const index = selectedItems.findIndex(item => item.id === itemId);
    return index !== -1 ? index + 1 : null;
  };

  if (!foodItem) return <div className="p-4">Loading...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Main Content */}
      <div className="flex-1 px-4 py-6">
        
        {/* Title */}
        <h2 className="text-3xl font-bold text-center mb-6">{foodItem.title}</h2>
        
        {/* Apple Image */}
        <div className="flex justify-center mb-6">
          <img 
            src={`/src/assets/${foodItem.image}`}
            alt={foodItem.title}
            className="w-80 h-80 object-cover rounded-lg shadow-lg"
          />
        </div>

        {/* User Is Also Trading Section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">User Is Also Trading</h3>
          <div className="flex justify-center space-x-6">
            <div className="text-center">
              <img 
                src={orangeJuiceImage}
                alt="Orange Juice" 
                className="w-24 h-24 object-cover rounded-lg shadow-md"
              />
              <p className="text-sm mt-2">Orange Juice</p>
            </div>
            <div className="text-center">
              <img 
                src={upAndGoImage}
                alt="Up&Go Drink" 
                className="w-24 h-24 object-cover rounded-lg shadow-md"
              />
              <p className="text-sm mt-2">Up&Go Drink</p>
            </div>
          </div>
        </div>

        {/* Trade Button */}
        <div className="flex justify-center">
          <button 
            onClick={handleTradeClick}
            className="bg-[#C5BAFF] text-white px-16 py-4 rounded-full text-xl font-semibold hover:bg-gray-500 transition-colors shadow-lg"
          >
            Trade
          </button>
        </div>
      </div>

      {/* Trade Modal Popup */}
      {showTradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#C5BAFF] rounded-2xl w-full max-w-sm mx-4 shadow-2xl max-h-[80vh] flex flex-col">
            <div className="p-5 flex-shrink-0">
              <h3 className="text-2xl font-bold mb-4 text-white text-center">Select What To Trade</h3>
              
              {userItems.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-purple-100 mb-4">No items in your inventory yet!</p>
                  <p className="text-purple-200 text-sm">Take some photos to add items you can trade.</p>
                </div>
              ) : (
                <>
                  {/* Scrollable Grid of Items */}
                  <div className="max-h-75 overflow-y-auto mb-6  p-2">
                    <div className="grid grid-cols-2 gap-3 pr-2">
                      {userItems.map((item) => {
                        const isSelected = selectedItems.find(selected => selected.id === item.id);
                        const selectionNumber = getItemSelectionNumber(item.id);
                        
                        return (
                          <div
                            key={item.id}
                            onClick={() => handleItemSelect(item)}
                            className={`relative bg-white rounded-lg py-3 cursor-pointer transition-all duration-200 ${
                              isSelected ? 'ring-4 ring-yellow-300 shadow-lg' : 'hover:shadow-md'
                            }`}
                          >
                            {/* Selection Circle */}
                            <div className="absolute top-2 right-2 w-6 h-6">
                              {isSelected ? (
                                <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                                  <span className="text-xs font-bold text-purple-800">{selectionNumber}</span>
                                </div>
                              ) : (
                                <div className="w-6 h-6 border-2 border-gray-300 rounded-full bg-white"></div>
                              )}
                            </div>
                            
                            {/* Item Image */}
                            <img 
                              src={item.image}
                              alt={item.name}
                              className="w-25 h-20 object-cover rounded-lg mx-auto mb-2"
                            />
                            
                            {/* Item Name */}
                            <p className="text-xs font-medium text-gray-800 text-center truncate">{item.name}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Selection Info */}
                  <div className="mb-4">
                    <p className="text-sm text-purple-100">
                      Selected: {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''}
                    </p>
                    {selectedItems.length > 0 && (
                      <div className="mt-2 max-h-16 overflow-y-auto">
                        <div className="flex flex-wrap gap-1">
                          {selectedItems.map((item, index) => (
                            <span key={item.id} className="text-xs bg-yellow-400 text-purple-800 px-2 py-1 rounded-full font-medium">
                              {index + 1}. {item.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            
            {/* Action Buttons - Fixed at bottom */}
            <div className="p-6 pt-0 flex-shrink-0">
              <div className="flex space-x-4">
                <button 
                  onClick={closeModal}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmTrade}
                  disabled={selectedItems.length === 0 || userItems.length === 0}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    selectedItems.length > 0 && userItems.length > 0
                      ? 'bg-yellow-400 text-purple-800 hover:bg-yellow-300' 
                      : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  {userItems.length === 0 ? 'No Items' : `Confirm (${selectedItems.length})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default FoodDetail;