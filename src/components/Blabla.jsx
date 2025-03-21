import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { FaCar, FaHandHoldingUsd } from "react-icons/fa"; // Import Icons

const BlaBla = () => {
  const [showForm, setShowForm] = useState(false);
  const [rides, setRides] = useState([]);
  const [formData, setFormData] = useState({
    startAddress: "",
    endAddress: "",
    pincode: "",
    phoneNumber: "",
    rideType: "offer",
  });

  const user = auth.currentUser; // Get currently logged-in user

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert("Please log in to offer a ride.");
      return;
    }

    const newRide = {
      ...formData,
      userId: user.uid, // Store User ID from Firebase Auth
      timestamp: new Date(),
    };

    try {
      await addDoc(collection(db, "blabla"), newRide); // Add to Firestore
      alert("Ride added successfully!");
      setShowForm(false); // Hide form after submission
      fetchRides(); // Refresh rides list
    } catch (error) {
      console.error("Error adding ride:", error);
    }
  };

  // Fetch Rides from Firestore
  const fetchRides = async () => {
    const querySnapshot = await getDocs(collection(db, "blabla"));
    const rideList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setRides(rideList);
  };

  useEffect(() => {
    fetchRides();
  }, []);

  return (
    <div className="blabla-container">
      <h1>BlaBla Ride Sharing</h1>

      {/* Buttons to Select Ride Option */}
      <div className="ride-options">
        <button onClick={() => setShowForm(true)}>
          <FaCar /> Offer a Ride
        </button>
        <button>
          <FaHandHoldingUsd /> Need a Ride
        </button>
      </div>

      {/* Ride Form */}
      {showForm && (
        <form className="ride-form" onSubmit={handleSubmit}>
          <label>Start Address:</label>
          <input type="text" name="startAddress" value={formData.startAddress} onChange={handleChange} required />

          <label>End Address:</label>
          <input type="text" name="endAddress" value={formData.endAddress} onChange={handleChange} required />

          <label>Pincode:</label>
          <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} required />

          <label>Phone Number:</label>
          <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />

          <label>Ride Type:</label>
          <select name="rideType" value={formData.rideType} onChange={handleChange}>
            <option value="offer">Offer a Ride</option>
            <option value="need">Need a Ride</option>
          </select>

          <button type="submit">Submit</button>
        </form>
      )}

      {/* Display List of Rides */}
      <h2>Available Rides</h2>
      <ul>
        {rides.map((ride) => (
          <li key={ride.id}>
            <strong>{ride.startAddress} → {ride.endAddress}</strong>  
            <p>Pincode: {ride.pincode} | Phone: {ride.phoneNumber}</p>
            <p>Ride Type: {ride.rideType} | User ID: {ride.userId}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BlaBla;
