import React, { useState, useEffect, useRef } from 'react';
import { getUserProfile, editFoodItem, deleteFoodItem, addFoodItem } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { Button } from "/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "/components/ui/card";
import { Pencil, Trash } from "lucide-react";
import { EditDialog, DeleteDialog } from "../components/EditDeleteDialogs";

function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(getUserProfile('user1'));
  const [selectedItem, setSelectedItem] = useState(null);
  const [dialogType, setDialogType] = useState(null); // 'edit' or 'delete'
  const [foodImages, setFoodImages] = useState({});
  const processedImages = useRef(new Set()); // Track which images we've already processed

  // Load images from localStorage on component mount
  useEffect(() => {
    const loadImagesFromStorage = () => {
      const images = {};
      const newItems = [];
      
      console.log('Checking localStorage for food images...');
      
      // Check localStorage for food images (saved from AddFood component)
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('food-image-')) {
          const foodId = key.replace('food-image-', '');
          const imageData = localStorage.getItem(key);
          console.log(`Found food image: ${key}, foodId: ${foodId}`);
          
          if (imageData) {
            images[foodId] = imageData;
            
            // Only process this image if we haven't processed it before
            if (!processedImages.current.has(foodId)) {
              // Check if this item already exists in inventory by checking for fromAddFood flag and foodId
              const existingItem = profile.inventory.find(item => 
                item.fromAddFood && item.originalFoodId === foodId
              );
              
              console.log(`Checking foodId ${foodId}, existing:`, existingItem);
              
              if (!existingItem) {
                // Create a new food item based on the food ID
                // Try to get the stored food name, or use a generic name
                const storedName = localStorage.getItem(`food-name-${foodId}`);
                const itemName = storedName || `Food Item ${foodId}`;
                
                const newItem = {
                  id: Date.now() + parseInt(foodId), // Ensure unique ID
                  title: itemName,
                  image: null, // Will use localStorage image
                  fromAddFood: true, // Flag to indicate this came from AddFood
                  originalFoodId: foodId // Store the original food ID for checking
                };
                
                console.log('Creating new item:', newItem);
                newItems.push(newItem);
                processedImages.current.add(foodId); // Mark as processed
              }
            }
          }
        }
      }
      
      setFoodImages(images);
      console.log('Set food images:', images);
      
      // Add new items directly to profile state
      if (newItems.length > 0) {
        setProfile(prevProfile => ({
          ...prevProfile,
          inventory: [...prevProfile.inventory, ...newItems]
        }));
        console.log('Updated profile with new items');
      }
    };

    loadImagesFromStorage();
  }, []); // Only run once on mount

  // Helper function to get image source for an item
  const getImageSource = (item) => {
    // For items from AddFood, use localStorage images based on the original food detection IDs
    if (item.fromAddFood && item.originalFoodId) {
      const foodId = item.originalFoodId;
      if (foodImages[foodId]) {
        return foodImages[foodId];
      }
    }
    
    // For original stock items, always use the asset path
    return `/src/assets/${item.image}`;
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
    editFoodItem('user1', selectedItem.id, updatedItem);
    setProfile(getUserProfile('user1'));
    closeDialog();
  };

  const confirmDelete = () => {
    deleteFoodItem('user1', selectedItem.id);
    setProfile(getUserProfile('user1'));
    closeDialog();
  };

  return (
    <div className="p-4">
      {/* User Info Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-lg">Name: {profile.name}</p>
        <p className="text-lg">Classroom: {profile.classroom}</p>
      </div>

      {/* Clear button */}
      <Button 
        onClick={() => {
          // Remove all food images and names from localStorage
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('food-image-') || key.startsWith('food-name-'))) {
              keysToRemove.push(key);
            }
          }
          
          keysToRemove.forEach(key => {
            localStorage.removeItem(key);
          });
          
          // Remove items with fromAddFood flag from inventory (keep original stock items)
          setProfile(prevProfile => ({
            ...prevProfile,
            inventory: prevProfile.inventory.filter(item => !item.fromAddFood)
          }));
          
          // Clear the food images state
          setFoodImages({});
          
          // Reset the processed images tracker
          processedImages.current.clear();
          
          console.log('Cleared all captured food images and items');
        }}
        className="mb-4 bg-red-500 hover:bg-red-600"
      >
        Clear Inventory
      </Button>

      {/* Inventory Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Current Inventory</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {profile.inventory
            .filter(item => item.fromAddFood) // Only show items from AddFood, exclude stock items
            .map((item) => (
            <Card key={item.id} className="w-full max-w-sm shadow-md">
              <CardHeader className="relative p-0">
                <div className="relative w-full aspect-[3/4]">
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
        
        {/* Show message if no captured items */}
        {profile.inventory.filter(item => item.fromAddFood).length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p>No food items captured yet.</p>
            <p>Use the "Add New Food Item" button to capture food with your camera!</p>
          </div>
        )}
      </div>

      {/* Add Button */}
      <div className="text-center">
        <Button onClick={() => navigate('/add')}>Add New Food Item</Button>
      </div>

      {/* Dialogs */}
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