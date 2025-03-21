import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase"; // Firebase setup
import { collection, addDoc, getDocs, doc, setDoc } from "firebase/firestore";

import "./Blabla.css"; // Ensure this file exists

const Blabla = () => {
  const [rides, setRides] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [rideType, setRideType] = useState("offer"); // Default: Offer a Ride
  const [startAddress, setStartAddress] = useState("");
  const [endAddress, setEndAddress] = useState("");
  const [price, setPrice] = useState("");
  const [seatsAvailable, setSeatsAvailable] = useState(1);
  const [contactNumber, setContactNumber] = useState("");
  const [selectedTab, setSelectedTab] = useState("offer"); // 'offer' or 'need'
  const [loading, setLoading] = useState(false);

  // Fetch all rides based on selected tab
  useEffect(() => {
    const fetchRides = async () => {
      const querySnapshot = await getDocs(collection(db, "blabla"));
      const rideList = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((ride) => ride.rideType !== selectedTab); // Show opposite ride type
      setRides(rideList);
    };
    fetchRides();
  }, [selectedTab]); // Fetch whenever tab changes

  // Handle Ride Submission
  const handleRideSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "blabla"), {
        rideType,
        startAddress,
        endAddress,
        price,
        seatsAvailable,
        contactNumber,
        userId: auth.currentUser?.uid || "anonymous",
        createdAt: new Date(),
      });
      alert("Ride added successfully!");
      setShowForm(false);
    } catch (error) {
      console.error("Error adding ride:", error);
    }
    setLoading(false);
  };

  // Confirm Ride & Store in `cirm` Collection
  const confirmRide = async (rideId) => {
    if (!auth.currentUser) {
      alert("Please log in to confirm a ride.");
      return;
    }
    try {
      const confirmRef = doc(collection(db, "cirm"), rideId);
      await setDoc(confirmRef, {
        userId: auth.currentUser.uid,
        rideId: rideId,
        confirmedAt: new Date(),
      });
      alert("Ride confirmed successfully!");
    } catch (error) {
      console.error("Error confirming ride:", error);
    }
  };

  return (
    <div className="ride-container">
      <h2>🚗 BlaBla Rides</h2>

      {/* Create New Ride Button */}
      <button className="btn-create" onClick={() => setShowForm(!showForm)}>
        {showForm ? "❌ Close Form" : "➕ Create New Ride"}
      </button>

      {/* Ride Form */}
      {showForm && (
        <form className="ride-form animate-fade" onSubmit={handleRideSubmit}>
          <label>
            Ride Type:
            <select value={rideType} onChange={(e) => setRideType(e.target.value)}>
              <option value="offer">🚗 Offer a Ride</option>
              <option value="need">🙋‍♂️ Need a Ride</option>
            </select>
          </label>
          <input type="text" placeholder="📍 Start Address" value={startAddress} onChange={(e) => setStartAddress(e.target.value)} required />
          <input type="text" placeholder="📍 End Address" value={endAddress} onChange={(e) => setEndAddress(e.target.value)} required />
          {rideType === "offer" && (
            <>
              <input type="number" placeholder="💰 Price" value={price} onChange={(e) => setPrice(e.target.value)} required />
              <input type="number" placeholder="🪑 Seats Available" value={seatsAvailable} onChange={(e) => setSeatsAvailable(e.target.value)} required />
            </>
          )}
          <input type="tel" placeholder="📞 Contact Number" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} required />
          <button type="submit" disabled={loading}>
            {loading ? "🚀 Saving..." : "✅ Submit Ride"}
          </button>
        </form>
      )}

      {/* Ride Type Tabs */}
      <div className="ride-tabs">
        <button className={selectedTab === "offer" ? "active" : ""} onClick={() => setSelectedTab("offer")}>
          🚗 View Need Rides
        </button>
        <button className={selectedTab === "need" ? "active" : ""} onClick={() => setSelectedTab("need")}>
          👥 View Offered Rides
        </button>
      </div>

      {/* Display Available Rides Based on Selection */}
      <div className="ride-list">
        <h3>{selectedTab === "offer" ? "🙋‍♂️ People Who Need Rides" : "🚗 Available Offered Rides"}</h3>
        {rides.length === 0 ? (
          <p>🚫 No rides available.</p>
        ) : (
          rides.map((ride) => (
            <div key={ride.id} className="ride-card animate-slide">
              <p><strong>🛣 Start:</strong> {ride.startAddress}</p>
              <p><strong>🏁 End:</strong> {ride.endAddress}</p>
              {ride.rideType === "offer" && (
                <>
                  <p><strong>💰 Price:</strong> ₹{ride.price}</p>
                  <p><strong>🪑 Seats Available:</strong> {ride.seatsAvailable}</p>
                </>
              )}
              <p><strong>📞 Contact:</strong> {ride.contactNumber}</p>
              <button className="btn-confirm" onClick={() => confirmRide(ride.id)}>
                ✅ Confirm Ride
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Blabla;
