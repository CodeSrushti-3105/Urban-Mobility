import React, { useState } from "react";
import { db } from "../firebase"; // Firebase Firestore
import { collection, addDoc } from "firebase/firestore";
import "./Owner.css"; // Styling file

const Owner = () => {
  const [vehicleName, setVehicleName] = useState("");
  const [model, setModel] = useState("");
  const [availability, setAvailability] = useState("Yes");
  const [price, setPrice] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");

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
        timestamp: new Date(), // Add timestamp for ordering data
      });

      setMessage("✅ Vehicle Registered Successfully!");
      setVehicleName("");
      setModel("");
      setAvailability("Yes");
      setPrice("");
      setContact("");
    } catch (error) {
      console.error("Error adding document: ", error);
      setMessage("❌ Error registering vehicle.");
    }
  };

  return (
    <div className="owner-container">
      <h2>Register Your Vehicle</h2>

      {message && <p className="message">{message}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Vehicle Name"
          value={vehicleName}
          onChange={(e) => setVehicleName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          required
        />
        <select value={availability} onChange={(e) => setAvailability(e.target.value)}>
          <option value="Yes">Available</option>
          <option value="No">Not Available</option>
        </select>
        <input
          type="number"
          placeholder="Price per Day"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Contact Details"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          required
        />
        <button type="submit">Register Vehicle</button>
      </form>
    </div>
  );
};

export default Owner;
