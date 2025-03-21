import React, { useState, useEffect, useCallback } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, getDocs, serverTimestamp, query, where } from "firebase/firestore";
import { FaCar, FaCheckCircle } from "react-icons/fa";

const BlaBla = () => {
  const [showForm, setShowForm] = useState(false);
  const [rides, setRides] = useState([]);
  const [confirmedRides, setConfirmedRides] = useState([]);
  const [formData, setFormData] = useState({
    startAddress: "",
    endAddress: "",
    pincode: "",
    phoneNumber: "",
    price: "",
    rideType: "offer",
  });

  const user = auth.currentUser;

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit New Ride
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in to offer a ride.");
      return;
    }

    const newRide = {
      ...formData,
      userId: user.uid,
      timestamp: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "rides"), newRide);
      alert("Ride added successfully!");
      setShowForm(false);
      fetchRides();
    } catch (error) {
      console.error("Error adding ride:", error);
    }
  };

  // Confirm a Ride
  const confirmRide = async (rideId) => {
    if (!user) {
      alert("Please log in to confirm a ride.");
      return;
    }

    try {
      await addDoc(collection(db, "confirmedRides"), {
        rideId,
        confirmedByUserId: user.uid,
        timestamp: serverTimestamp(),
      });
      alert("Ride confirmed successfully!");
      fetchConfirmedRides();
    } catch (error) {
      console.error("Error confirming ride:", error);
    }
  };

  // Fetch Available Rides
  const fetchRides = async () => {
    const querySnapshot = await getDocs(collection(db, "rides"));
    const rideList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setRides(rideList);
  };

  // Fetch Confirmed Rides for the Logged-in User
  const fetchConfirmedRides = useCallback(async () => {
    if (!user) return;

    const q = query(collection(db, "confirmedRides"), where("confirmedByUserId", "==", user.uid));
    const querySnapshot = await getDocs(q);
    const confirmedList = querySnapshot.docs.map(doc => doc.data().rideId);
    setConfirmedRides(confirmedList);
  }, [user]);

  useEffect(() => {
    fetchConfirmedRides();
  }, [fetchConfirmedRides]); // ✅ Now correctly using useCallback

  return (
    <div className="blabla-container">
      <h1>BlaBla Ride Sharing</h1>
      <div className="ride-options">
        <button onClick={() => setShowForm(true)}>
          <FaCar /> Offer a Ride
        </button>
      </div>

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
          
          <label>Price (INR):</label>
          <input type="number" name="price" value={formData.price} onChange={handleChange} required />
          
          <label>Ride Type:</label>
          <select name="rideType" value={formData.rideType} onChange={handleChange}>
            <option value="offer">Offer a Ride</option>
            <option value="need">Need a Ride</option>
          </select>

          <button type="submit">Submit</button>
        </form>
      )}

      {/* Available Rides */}
      <h2>Available Rides</h2>
      <ul>
        {rides.map((ride) => (
          <li key={ride.id}>
            <strong>{ride.startAddress} → {ride.endAddress}</strong> 
            <p>Pincode: {ride.pincode} | Phone: {ride.phoneNumber}</p>
            <p>Price: ₹{ride.price} | Type: {ride.rideType}</p>
            {!confirmedRides.includes(ride.id) && (
              <button onClick={() => confirmRide(ride.id)}>
                Confirm Ride
              </button>
            )}
          </li>
        ))}
      </ul>

      {/* User's Confirmed Rides */}
      <h2>My Confirmed Rides</h2>
      <ul>
        {rides.filter(ride => confirmedRides.includes(ride.id)).map((ride) => (
          <li key={ride.id}>
            <FaCheckCircle style={{ color: "green" }} />
            <strong>{ride.startAddress} → {ride.endAddress}</strong>
            <p>Pincode: {ride.pincode} | Phone: {ride.phoneNumber}</p>
            <p>Price: ₹{ride.price} | Type: {ride.rideType}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BlaBla;
