import React, { useEffect, useState } from 'react';
import { getFoodListings, searchFoodListings } from "../lib/api";
import { FoodCard } from "/components/ui/food-card";
import { Plus } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

function Home() {
  const [listings, setListings] = useState([]);
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get('search');

  useEffect(() => {
    let data;
    if (searchTerm) {
      data = searchFoodListings(searchTerm);
    } else {
      data = getFoodListings();
    }
    setListings(data);
  }, [searchTerm]);

  return (
    <div className="relative">
      {/* Search results header */}
      {searchTerm && (
        <div className="mx-4 mt-4 mb-2">
          <h2 className="text-lg font-semibold text-gray-800">
            Search results for "{searchTerm}"
          </h2>
          <p className="text-sm text-gray-600">
            {listings.length} item{listings.length !== 1 ? 's' : ''} found
          </p>
        </div>
      )}
      
      <div className="mx-4 my-4 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 place-items-center">
        {listings.length > 0 ? (
          listings.map((item) => (
            <FoodCard
              key={item.id}
              imageSrc={`/src/assets/${item.image}`}
              label={item.title}
            />
          ))
        ) : searchTerm ? (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">No food items found for "{searchTerm}"</p>
            <p className="text-sm text-gray-400 mt-1">Try searching with different keywords</p>
          </div>
        ) : (
        listings.map((item) => (
          <FoodCard
            key={item.id}
            id={item.id}
            imageSrc={`/src/assets/${item.image}`}
            label={item.title}
          />
        )))}
      </div>

      {/* Floating Add Button */}
      <Link
        to="/add"
        className="fixed bottom-6 right-6 bg-white text-black p-4 rounded-full shadow-lg hover:bg-gray-100 transition"
      >
        <Plus className="w-6 h-6" />
      </Link>
    </div>
  );
}

export default Home;
