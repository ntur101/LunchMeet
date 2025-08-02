import React, { useState, useEffect } from 'react';
import { getUserProfile, editFoodItem, deleteFoodItem } from '../lib/api';
import { Button } from "/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "/components/ui/card";
import { Pencil, Trash } from "lucide-react";
import { EditDialog, DeleteDialog } from "../components/EditDeleteDialogs";

function Profile() {
  const [profile, setProfile] = useState(getUserProfile('user1'));
  const [selectedItem, setSelectedItem] = useState(null);
  const [dialogType, setDialogType] = useState(null); // 'edit' or 'delete'
  const [foodImages, setFoodImages] = useState({});

  // Load images from localStorage on component mount
  useEffect(() => {
    const loadImagesFromStorage = () => {
      const images = {};
      // Check localStorage for food images (saved from AddFood component)
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('food-image-')) {
          const foodId = key.replace('food-image-', '');
          const imageData = localStorage.getItem(key);
          if (imageData) {
            images[foodId] = imageData;
          }
        }
      }
      setFoodImages(images);
    };

    loadImagesFromStorage();
  }, []);

  // Helper function to get image source for an item
  const getImageSource = (item) => {
    // First try to get from localStorage (from AddFood)
    if (foodImages[item.id]) {
      return foodImages[item.id];
    }
    // Fallback to the original image path
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

      {/* Inventory Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Current Inventory</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {profile.inventory.map((item) => (
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
      </div>

      {/* Add Button */}
      <div className="text-center">
        <Button>Add New Food Item</Button>
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