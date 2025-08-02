import React from 'react';
import { getUserProfile } from '../lib/api';
import { Button } from "/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "/components/ui/card";
import { Pencil, Trash } from "lucide-react";

function Profile() {
  const profile = getUserProfile('user1');

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
            <Card key={item.id} className="w-full max-w-sm">
              <CardHeader className="relative p-0">
                <img
                  src={`/src/assets/${item.image}`}
                  alt={item.title}
                  className="w-full h-48 object-cover rounded-t-md"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <button className="p-1 rounded hover:bg-muted">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button className="p-1 rounded hover:bg-muted">
                    <Trash className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-lg font-semibold mt-2">{item.title}</CardTitle>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Add Button */}
      <div className="text-center">
        <Button>Add New Food Item</Button>
      </div>
    </div>
  );
}

export default Profile;