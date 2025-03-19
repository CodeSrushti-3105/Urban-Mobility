import React, { useState } from "react";
import "./Driver.css";
import { useNavigate } from "react-router-dom";

const Driver = () => {
  const [selection, setSelection] = useState(null);
  const [formData, setFormData] = useState({}); // Store form input values
  const navigate = useNavigate();

  const handleSelection = (option) => {
    setSelection(option);
    setFormData({}); // Reset form when switching options
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent page refresh
    console.log("Form Submitted:", formData);
    alert("Form submitted successfully!"); // Temporary alert
  };

  return (
    <div className="driver-container">
      <h2>Driver Section</h2>

      <div className="options">
        <button
          className={`option-btn ${selection === "drive" ? "active" : ""}`}
          onClick={() => handleSelection("drive")}
        >
          Do you drive?
        </button>

        <button
          className={`option-btn ${selection === "want-driver" ? "active" : ""}`}
          onClick={() => handleSelection("want-driver")}
        >
          Do you want a driver?
        </button>
      </div>

      {/* Driver Registration Form */}
      {selection === "drive" && (
        <div className="form-section">
          <h3>Driver Registration</h3>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              required
              onChange={handleChange}
            />
            <input
              type="text"
              name="license"
              placeholder="License Number"
              required
              onChange={handleChange}
            />
            <input
              type="text"
              name="location"
              placeholder="Available Location"
              required
              onChange={handleChange}
            />
            <button type="submit">Register as Driver</button>
          </form>
        </div>
      )}

      {/* Request a Driver Form */}
      {selection === "want-driver" && (
        <div className="form-section">
          <h3>Request a Driver</h3>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="location"
              placeholder="Your Location"
              required
              onChange={handleChange}
            />
            <input
              type="text"
              name="time"
              placeholder="Preferred Time"
              required
              onChange={handleChange}
            />
            <input
              type="text"
              name="vehicle"
              placeholder="Vehicle Type"
              required
              onChange={handleChange}
            />
            <button type="submit">Find a Driver</button>
          </form>
        </div>
      )}

      <button className="back-btn" onClick={() => navigate(-1)}>Go Back</button>
    </div>
  );
};

export default Driver;
