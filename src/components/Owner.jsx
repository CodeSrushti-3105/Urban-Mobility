import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase"; // ✅ Import auth to get user
import { collection, getDocs, addDoc, deleteDoc, doc, setDoc, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "./Owner.css"; // Styling file

const Owner = () => {
  const [vehicleName, setVehicleName] = useState("");
  const [model, setModel] = useState("");
  const [availability, setAvailability] = useState("Yes");
  const [price, setPrice] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [vehicles, setVehicles] = useState([]); // Store user-specific vehicles
  const [userId, setUserId] = useState(null); // ✅ Store logged-in user ID
  const [deletedVehicle, setDeletedVehicle] = useState(null); // Store last deleted vehicle
  const [undoTimeout, setUndoTimeout] = useState(null); // Store timeout ID

  // ✅ Get logged-in user's UID
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid); // ✅ Store the user ID
        fetchVehicles(user.uid); // ✅ Fetch only this user's vehicles
      } else {
        setUserId(null);
        setVehicles([]); // Clear vehicles if logged out
      }
    });

    return () => unsubscribe(); // Cleanup
  }, []);

  // ✅ Fetch only the logged-in user's vehicles
  const fetchVehicles = async (userId) => {
    try {
      const vehiclesCollection = collection(db, "vehicles");
      const q = query(vehiclesCollection, where("userId", "==", userId)); // ✅ Fetch only user's vehicles
      const vehicleSnapshot = await getDocs(q);
      const vehicleList = vehicleSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setVehicles(vehicleList);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

  // ✅ Add a new vehicle with user ID
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!userId) {
      setMessage("❌ Please log in to register a vehicle.");
      return;
    }

    try {
      await addDoc(collection(db, "vehicles"), {
        vehicleName,
        model,
        availability,
        price,
        contact,
        userId, // ✅ Store the user's unique ID
        timestamp: new Date(),
      });

      setMessage("✅ Vehicle Registered Successfully!");
      setVehicleName("");
      setModel("");
      setAvailability("Yes");
      setPrice("");
      setContact("");

      fetchVehicles(userId); // Refresh user's vehicles
    } catch (error) {
      console.error("Error adding document: ", error);
      setMessage("❌ Error registering vehicle.");
    }
  };

  // ✅ Delete a vehicle
  const handleDelete = async (id) => {
    try {
      const vehicleToDelete = vehicles.find((vehicle) => vehicle.id === id);
      if (!vehicleToDelete) return;

      setDeletedVehicle(vehicleToDelete); // Store the deleted vehicle
      setVehicles(vehicles.filter((vehicle) => vehicle.id !== id)); // Update UI
      await deleteDoc(doc(db, "vehicles", id));

      // Set a timer to clear the undo option after 5 seconds
      const timeout = setTimeout(() => {
        setDeletedVehicle(null);
      }, 5000000);
      setUndoTimeout(timeout);
    } catch (error) {
      console.error("Error deleting vehicle:", error);
    }
  };

  // ✅ Restore the deleted vehicle
  const handleUndo = async () => {
    if (!deletedVehicle) return;

    try {
      await setDoc(doc(db, "vehicles", deletedVehicle.id), deletedVehicle);
      setVehicles([...vehicles, deletedVehicle]); // Restore in UI
      setDeletedVehicle(null);
      clearTimeout(undoTimeout); // Clear timeout
    } catch (error) {
      console.error("Error restoring vehicle:", error);
    }
  };

  return (
    <div className="owner-container">
      <h2>Register Your Vehicle</h2>

      {message && <p className="message">{message}</p>}

      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Vehicle Name" value={vehicleName} onChange={(e) => setVehicleName(e.target.value)} required />
        <input type="text" placeholder="Model" value={model} onChange={(e) => setModel(e.target.value)} required />
        <select value={availability} onChange={(e) => setAvailability(e.target.value)}>
          <option value="Yes">Available</option>
          <option value="No">Not Available</option>
        </select>
        <input type="number" placeholder="Price per Day" value={price} onChange={(e) => setPrice(e.target.value)} required />
        <input type="text" placeholder="Contact Details" value={contact} onChange={(e) => setContact(e.target.value)} required />
        <button type="submit">Register Vehicle</button>
      </form>

      {/* List of Vehicles */}
      <h2>Your Vehicles</h2>
      <div className="vehicle-list">
        {vehicles.length === 0 ? (
          <p>No vehicles added yet.</p>
        ) : (
          vehicles.map((vehicle) => (
            <div key={vehicle.id} className="vehicle-card">
              <h3>{vehicle.vehicleName}</h3>
              <p><strong>Model:</strong> {vehicle.model}</p>
              <p><strong>Availability:</strong> {vehicle.availability}</p>
              <p><strong>Price per Day:</strong> ₹{vehicle.price}</p>
              <p><strong>Contact:</strong> {vehicle.contact}</p>
              <button onClick={() => handleDelete(vehicle.id)} className="delete-btn">❌ Delete</button>
            </div>
          ))
        )}
      </div>

      {/* Undo Delete Button */}
      {deletedVehicle && (
        <div className="undo-container">
          <p>Vehicle deleted! <button onClick={handleUndo} className="undo-btn">Undo</button></p>
        </div>
      )}
    </div>
  );
};

export default Owner;
