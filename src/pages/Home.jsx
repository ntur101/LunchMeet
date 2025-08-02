import React, { useEffect, useState } from 'react';
import { getFoodListings } from "../lib/api";
import { FoodCard } from "/components/ui/food-card";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

function Home() {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    const data = getFoodListings();
    setListings(data);
  }, []);

  return (
    <div className="relative">
      <div className="mx-4 my-4 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 place-items-center">
        {listings.map((item) => (
          <FoodCard
            key={item.id}
            imageSrc={`/src/assets/${item.image}`}
            label={item.title}
          />
        ))}
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
