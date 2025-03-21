import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, getDocs, doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import "./Blabla.css";

const Blabla = () => {
  const [rides, setRides] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [rideType, setRideType] = useState("offer");
  const [startAddress, setStartAddress] = useState("");
  const [endAddress, setEndAddress] = useState("");
  const [price, setPrice] = useState("");
  const [seatsAvailable, setSeatsAvailable] = useState(1);
  const [contactNumber, setContactNumber] = useState("");
  const [selectedTab, setSelectedTab] = useState("offer");
  const [loading, setLoading] = useState(false);
  const [editingRide, setEditingRide] = useState(null); // Store ride being edited

  // Fetch rides
  useEffect(() => {
    const fetchRides = async () => {
      const querySnapshot = await getDocs(collection(db, "blabla"));
      const rideList = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((ride) => ride.rideType !== selectedTab);
      setRides(rideList);
    };
    fetchRides();
  }, [selectedTab]);

  // Add or Update Ride
  const handleRideSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingRide) {
        // Update existing ride
        const rideRef = doc(db, "blabla", editingRide.id);
        await updateDoc(rideRef, { startAddress, endAddress, price, seatsAvailable, contactNumber });
        setRides(rides.map((r) => (r.id === editingRide.id ? { ...r, startAddress, endAddress, price, seatsAvailable, contactNumber } : r)));
        setEditingRide(null);
      } else {
        // Add new ride
        const docRef = await addDoc(collection(db, "blabla"), {
          rideType,
          startAddress,
          endAddress,
          price,
          seatsAvailable,
          contactNumber,
          userId: auth.currentUser?.uid || "anonymous",
          createdAt: new Date(),
        });
        setRides([...rides, { id: docRef.id, rideType, startAddress, endAddress, price, seatsAvailable, contactNumber }]);
      }
      
      alert(editingRide ? "Ride updated successfully!" : "Ride added successfully!");
      setShowForm(false);
      setEditingRide(null);
    } catch (error) {
      console.error("Error saving ride:", error);
    }

    setLoading(false);
  };

  // Confirm Ride
  const confirmRide = async (rideId) => {
    if (!auth.currentUser) {
      alert("Please log in to confirm a ride.");
      return;
    }
    try {
      await setDoc(doc(collection(db, "cirm"), rideId), {
        userId: auth.currentUser.uid,
        rideId,
        confirmedAt: new Date(),
      });
      alert("Ride confirmed successfully!");
    } catch (error) {
      console.error("Error confirming ride:", error);
    }
  };

  // Delete Ride
  const deleteRide = async (rideId) => {
    if (!window.confirm("Are you sure you want to delete this ride?")) return;
    try {
      await deleteDoc(doc(db, "blabla", rideId));
      setRides(rides.filter((r) => r.id !== rideId));
      alert("Ride deleted successfully!");
    } catch (error) {
      console.error("Error deleting ride:", error);
    }
  };

  // Edit Ride
  const editRide = (ride) => {
    setEditingRide(ride);
    setRideType(ride.rideType);
    setStartAddress(ride.startAddress);
    setEndAddress(ride.endAddress);
    setPrice(ride.price);
    setSeatsAvailable(ride.seatsAvailable);
    setContactNumber(ride.contactNumber);
    setShowForm(true);
  };

  return (
    <div className="ride-container">
      <h2>🚗 BlaBla Rides</h2>

      {/* Create/Edit Ride Button */}
      <button className="btn-create" onClick={() => { setShowForm(!showForm); setEditingRide(null); }}>
        {showForm ? "❌ Close Form" : editingRide ? "✏️ Edit Ride" : "➕ Create New Ride"}
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
            {loading ? "🚀 Saving..." : editingRide ? "✅ Update Ride" : "✅ Submit Ride"}
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

      {/* Display Rides */}
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
              <button className="btn-confirm" onClick={() => confirmRide(ride.id)}>✅ Confirm Ride</button>
              <button className="btn-edit" onClick={() => editRide(ride)}>✏️ Edit</button>
              <button className="btn-delete" onClick={() => deleteRide(ride.id)}>🗑 Delete</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Blabla;
