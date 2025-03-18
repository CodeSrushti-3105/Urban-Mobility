import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, addDoc, deleteDoc, doc, setDoc } from "firebase/firestore";
import "./Owner.css"; // Styling file

const Owner = () => {
  const [vehicleName, setVehicleName] = useState("");
  const [model, setModel] = useState("");
  const [availability, setAvailability] = useState("Yes");
  const [price, setPrice] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [vehicles, setVehicles] = useState([]); // Store vehicles
  const [deletedVehicle, setDeletedVehicle] = useState(null); // Store last deleted vehicle
  const [undoTimeout, setUndoTimeout] = useState(null); // Store timeout ID

  // Fetch vehicles from Firestore
  const fetchVehicles = async () => {
    try {
      const vehiclesCollection = collection(db, "vehicles");
      const vehicleSnapshot = await getDocs(vehiclesCollection);
      const vehicleList = vehicleSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setVehicles(vehicleList);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

  // Fetch vehicles on component mount
  useEffect(() => {
    fetchVehicles();
  }, []);

  // Add a new vehicle
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); // Reset message

    try {
      await addDoc(collection(db, "vehicles"), {
        vehicleName,
        model,
        availability,
        price,
        contact,
        timestamp: new Date(),
      });

      setMessage("✅ Vehicle Registered Successfully!");
      setVehicleName("");
      setModel("");
      setAvailability("Yes");
      setPrice("");
      setContact("");

      fetchVehicles();
    } catch (error) {
      console.error("Error adding document: ", error);
      setMessage("❌ Error registering vehicle.");
    }
  };

  // Delete a vehicle and enable undo option
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
      }, 5000);
      setUndoTimeout(timeout);
    } catch (error) {
      console.error("Error deleting vehicle:", error);
    }
  };

  // Restore the deleted vehicle
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
