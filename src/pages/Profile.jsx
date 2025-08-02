import React, { useState, useEffect } from 'react';
import { getUserProfile, editFoodItem, deleteFoodItem, addTestCameraItem } from '../lib/api';
import { Button } from "/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "/components/ui/card";
import { Pencil, Trash, Camera, Calendar, Plus } from "lucide-react";
import { EditDialog, DeleteDialog } from "../components/EditDeleteDialogs";
import { Link } from "react-router-dom";

function Profile() {
  const [profile, setProfile] = useState(getUserProfile('user1'));
  const [selectedItem, setSelectedItem] = useState(null);
  const [dialogType, setDialogType] = useState(null); // 'edit' or 'delete'

  // Refresh profile data periodically to show newly added items
  useEffect(() => {
    const refreshProfile = () => {
      setProfile(getUserProfile('user1'));
    };
    
    // Refresh immediately and then every 2 seconds
    refreshProfile();
    const interval = setInterval(refreshProfile, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // Helper function to determine image source
  const getImageSource = (item) => {
    // If the image starts with 'data:', it's a base64 image from camera capture
    if (item.image && item.image.startsWith('data:')) {
      return item.image;
    }
    // Otherwise, it's a traditional asset image
    return `/src/assets/${item.image}`;
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return '';
    }
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Current Inventory</h2>
          <div className="text-sm text-gray-600">
            {profile.inventory.length} item{profile.inventory.length !== 1 ? 's' : ''} total
            {profile.inventory.filter(item => item.source === 'camera_capture').length > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                {profile.inventory.filter(item => item.source === 'camera_capture').length} captured
              </span>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {profile.inventory.map((item) => (
            <Card key={item.id} className="w-full max-w-sm shadow-md">
              <CardHeader className="relative p-0">
                <div className="relative w-full aspect-[3/4]">
                  <img
                    src={getImageSource(item)}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover rounded-t-md"
                    onError={(e) => {
                      // Fallback to a placeholder if image fails to load
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI2NyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkZvb2QgSW1hZ2U8L3RleHQ+PC9zdmc+';
                    }}
                  />
                  
                  {/* Camera indicator for captured images */}
                  {item.source === 'camera_capture' && (
                    <div className="absolute top-2 left-2 bg-blue-500 text-white p-1 rounded-md flex items-center gap-1 text-xs">
                      <Camera className="w-3 h-3" />
                      <span>Captured</span>
                    </div>
                  )}
                  
                  {/* Confidence indicator for AI-detected items */}
                  {item.confidence && (
                    <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded-md text-xs">
                      {Math.round(item.confidence * 100)}% confident
                    </div>
                  )}
                  
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
                {/* Show date added for camera-captured items */}
                {item.dateAdded && (
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mt-1">
                    <Calendar className="w-3 h-3" />
                    <span>Added {formatDate(item.dateAdded)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Empty state when no items */}
        {profile.inventory.length === 0 && (
          <div className="text-center py-12">
            <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No food items yet</h3>
            <p className="text-gray-500 mb-6">Start by capturing some food with your camera!</p>
            <Link to="/add-food">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Item
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Add Button */}
      <div className="text-center space-y-2">
        <Link to="/add-food">
          <Button className="bg-blue-500 hover:bg-blue-600 text-white mr-2">
            <Plus className="w-4 h-4 mr-2" />
            Add Food with Camera
          </Button>
        </Link>
        
        {/* Test button to add a sample camera-captured item */}
        <Button 
          variant="outline" 
          onClick={() => {
            addTestCameraItem('user1');
            setProfile(getUserProfile('user1'));
          }}
          className="ml-2"
        >
          <Camera className="w-4 h-4 mr-2" />
          Add Test Item
        </Button>
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