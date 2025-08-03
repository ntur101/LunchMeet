import React, { useState, useEffect, useRef } from 'react';
import { useUser } from "./UserContext";
import { Button } from "/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "/components/ui/card";
import { Pencil, Trash, AlertTriangle } from "lucide-react";
import { EditDialog, DeleteDialog } from "../components/EditDeleteDialogs";

function Profile() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [dialogType, setDialogType] = useState(null); // 'edit' or 'delete'
  const [inventory, setInventory] = useState([]);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const processedImages = useRef(new Set());
  const { username } = useUser();

  // Load inventory from localStorage
  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = () => {
    const items = [];
    const currentProcessed = new Set();
    
    // Scan localStorage for food items
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('food-image-')) {
        const id = key.replace('food-image-', '');
        
        // Avoid duplicates
        if (currentProcessed.has(id)) continue;
        currentProcessed.add(id);
        
        const imageData = localStorage.getItem(key);
        const nameData = localStorage.getItem(`food-name-${id}`);
        
        if (imageData && nameData) {
          items.push({
            id: id,
            title: nameData,
            image: imageData, // This is now base64 data
            timestamp: parseInt(id) // Use the timestamp as sort key
          });
        }
      }
    }
    
    // Sort by timestamp (newest first)
    items.sort((a, b) => b.timestamp - a.timestamp);
    
    setInventory(items);
    processedImages.current = currentProcessed;
  };

  const openDialog = (type, item) => {
    setSelectedItem(item);
    setDialogType(type);
  };

  const closeDialog = () => {
    setSelectedItem(null);
    setDialogType(null);
  };

  const saveEdit = (updatedItem) => {
    // Update localStorage
    localStorage.setItem(`food-name-${selectedItem.id}`, updatedItem.title);
    
    // Reload inventory
    loadInventory();
    closeDialog();
  };

  const confirmDelete = () => {
    // Remove from localStorage
    localStorage.removeItem(`food-image-${selectedItem.id}`);
    localStorage.removeItem(`food-name-${selectedItem.id}`);
    
    // Reload inventory
    loadInventory();
    closeDialog();
  };

  const clearAllInventory = () => {
    // Remove all food items from localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('food-image-') || key.startsWith('food-name-'))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Reload inventory
    loadInventory();
    setShowClearDialog(false);
  };

  const getImageSource = (item) => {
    // If it's base64 data from camera, use it directly
    if (item.image && item.image.startsWith('data:')) {
      return item.image;
    }
    
    // Fallback for old static images
    return `/src/assets/${item.image}`;
  };

  return (
    <div className="p-4">
      {/* User Info Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Profile</h1>
            <p className="text-lg">Name: {username || "John Doe"}</p>
          </div>
          
          {/* Clear All Button */}
          {inventory.length > 0 && (
            <Button 
              variant="outline" 
              onClick={() => setShowClearDialog(true)}
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              <Trash className="w-4 h-4 mr-2" />
              Clear All ({inventory.length})
            </Button>
          )}
        </div>
      </div>

      {/* Inventory Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Current Inventory</h2>
        
        {inventory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg mb-2">No items in your inventory yet</p>
            <p className="text-sm">Take some photos using the camera to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {inventory.map((item) => (
              <Card key={item.id} className="w-full max-w-sm shadow-md">
                <CardHeader className="relative p-0">
                  <div className="relative w-full aspect-[7/4]">
                    <img
                      src={getImageSource(item)}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover rounded-t-md"
                    />
                    <div className="absolute top-2 right-2 flex gap-2 z-10">
                      <button
                        className="p-2 rounded-md bg-white/80 backdrop-blur hover:bg-white"
                        onClick={() => openDialog('edit', item)}
                      >
                        <Pencil className="w-4 h-4 text-gray-700" />
                      </button>
                      <button
                        className="p-2 rounded-md bg-white/80 backdrop-blur hover:bg-white"
                        onClick={() => openDialog('delete', item)}
                      >
                        <Trash className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg font-semibold mt-2 text-center">
                    {item.title}
                  </CardTitle>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Clear All Confirmation Dialog */}
      {showClearDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-semibold">Clear All Items</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove all {inventory.length} items from your inventory? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowClearDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={clearAllInventory}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Clear All
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Delete Dialogs */}
      {dialogType === 'edit' && (
        <EditDialog
          isOpen={!!dialogType}
          onClose={closeDialog}
          item={selectedItem}
          onSave={saveEdit}
        />
      )}
      {dialogType === 'delete' && (
        <DeleteDialog
          isOpen={!!dialogType}
          onClose={closeDialog}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

export default Profile;