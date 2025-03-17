import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import "./Subscription.css"; // Import CSS for styling

const Subscription = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  return (
    <div className="subscription-container">
      <h2>Choose Your Role</h2>
      <div className="subscription-options">
        <button className="subscription-btn" onClick={() => navigate("/owner")}>Owner</button>
        <button className="subscription-btn">User</button>
        <button className="subscription-btn">Driver</button>
      </div>
    </div>
  );
};

export default Subscription;
