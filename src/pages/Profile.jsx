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
        {/* <div className="flex justify-between items-center mb-4"> */}
          <h2 className="text-xl font-semibold">Current Inventory</h2>
          <div className="text-sm text-gray-600">
            {profile.inventory.length} item{profile.inventory.length !== 1 ? 's' : ''} total
            {profile.inventory.filter(item => item.source === 'camera_capture').length > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                {profile.inventory.filter(item => item.source === 'camera_capture').length} captured
              </span>
            )}
          </div>
        {/* </div> */}
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
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 rounded-md bg-white/80 backdrop-blur hover:bg-white"
                      onClick={() => openDialog('delete', item)}
                    >
                      <Trash className="w-4 h-4" />
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