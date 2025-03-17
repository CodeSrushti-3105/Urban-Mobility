import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "./Subscription.css"; // Import CSS for styling

const Subscription = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  return (
    <div className="subscription-container">
      <h2>Choose Your Role</h2>
      <div className="subscription-options">
        {/* Navigate to Owner Page */}
        <button className="subscription-btn" onClick={() => navigate("/owner")}>Owner</button>

        {/* Navigate to User Page */}
        <button className="subscription-btn" onClick={() => navigate("/user")}>User</button>

        {/* Navigate to Driver Page */}
        <button className="subscription-btn" onClick={() => navigate("/driver")}>Driver</button>
      </div>
    </div>
  );
};

export default Subscription;
