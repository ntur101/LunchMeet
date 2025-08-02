import React, { useEffect, useState } from 'react';
import { getFoodListings } from "../lib/api";
import { FoodCard } from "/components/ui/food-card";

function Home() {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    const data = getFoodListings();
    setListings(data);
  }, []);

  return (
    <div className="mx-4 my-4 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 place-items-center">
      {listings.map((item) => (
        <FoodCard
          key={item.id}
          imageSrc={`/src/assets/${item.image}`}
          label={item.title}
        />
      ))}
    </div>
  );
}

export default Home;
