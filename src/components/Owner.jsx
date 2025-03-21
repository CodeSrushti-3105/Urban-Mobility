import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, addDoc, deleteDoc, doc, setDoc, query, where, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "./Owner.css";

const Owner = () => {
  const [vehicleName, setVehicleName] = useState("");
  const [model, setModel] = useState("");
  const [availability, setAvailability] = useState("Yes");
  const [price, setPrice] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [userId, setUserId] = useState(null);
  const [deletedVehicle, setDeletedVehicle] = useState(null);
  const [undoTimeout, setUndoTimeout] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        fetchVehicles(user.uid);
      } else {
        setUserId(null);
        setVehicles([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchVehicles = async (userId) => {
    try {
      const vehiclesCollection = collection(db, "vehicles");
      const q = query(vehiclesCollection, where("userId", "==", userId));
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
        userId,
        timestamp: new Date(),
      });

      setMessage("✅ Vehicle Registered Successfully!");
      setVehicleName("");
      setModel("");
      setAvailability("Yes");
      setPrice("");
      setContact("");
      fetchVehicles(userId);
    } catch (error) {
      console.error("Error adding document: ", error);
      setMessage("❌ Error registering vehicle.");
    }
  };

  const handleDelete = async (id) => {
    try {
      const vehicleRef = doc(db, "vehicles", id);
      const vehicleSnap = await getDoc(vehicleRef);

      if (!vehicleSnap.exists()) {
        console.error("Vehicle not found!");
        return;
      }

      const vehicleData = vehicleSnap.data();
      if (vehicleData.userId !== userId) {
        console.error("Unauthorized deletion attempt!");
        return;
      }

      setDeletedVehicle(vehicleData);
      setVehicles(vehicles.filter((vehicle) => vehicle.id !== id));
      await deleteDoc(vehicleRef);

      const timeout = setTimeout(() => {
        setDeletedVehicle(null);
      }, 5000);
      setUndoTimeout(timeout);
    } catch (error) {
      console.error("Error deleting vehicle:", error);
    }
  };

  const handleUndo = async () => {
    if (!deletedVehicle) return;

    try {
      await setDoc(doc(db, "vehicles", deletedVehicle.id), deletedVehicle);
      setVehicles([...vehicles, deletedVehicle]);
      setDeletedVehicle(null);
      clearTimeout(undoTimeout);
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
      {deletedVehicle && (
        <div className="undo-container">
          <p>Vehicle deleted! <button onClick={handleUndo} className="undo-btn">Undo</button></p>
        </div>
      )}
    </div>
  );
};

export default Owner;
