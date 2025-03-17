import React from "react";
import "./Subscription.css"; // Import CSS for styling

const Subscription = () => {
  return (
    <div className="subscription-container">
      <h2>Choose Your Role</h2>
      <div className="subscription-options">
        <button className="subscription-btn">Owner</button>
        <button className="subscription-btn">User</button>
        <button className="subscription-btn">Driver</button>
      </div>
    </div>
  );
};

export default Subscription;
