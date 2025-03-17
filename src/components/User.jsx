import React, { useEffect, useState } from "react";
import { db } from "../firebase"; 
import { collection, getDocs } from "firebase/firestore"; 
import "./User.css";

const User = () => {
  const [vehicles, setVehicles] = useState([]); 

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "vehicles")); 
        const vehicleList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setVehicles(vehicleList); 
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      }
    };

    fetchVehicles();
  }, []);

  return (
    <div>
      <h2>Available Vehicles</h2>
      <div>
        {vehicles.length > 0 ? (
          vehicles.map((vehicle) => (
            <div key={vehicle.id} style={{ border: "1px solid black", padding: "10px", margin: "10px" }}>
              <h3>{vehicle.vehicleName}</h3>
              <p>Model: {vehicle.model}</p>
              <p>Availability: {vehicle.availability}</p>
              <p>Price per Day: ₹{vehicle.price}</p>
              <p>Contact: {vehicle.contact}</p>
            </div>
          ))
        ) : (
          <p>No vehicles available.</p>
        )}
      </div>
    </div>
  );
};

export default User;
