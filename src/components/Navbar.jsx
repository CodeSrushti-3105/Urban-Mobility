import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Signup from "./Signup";
import Login from "./Login"; // Import Login component
import "./Navbar.css"; // Ensure proper styling

const Navbar = () => {
  const navigate = useNavigate(); // Initialize navigate function
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false); // State for Login modal

  return (
    <>
      <nav className="navbar">
        <ul className="nav-links">
          {/* Redirect to Subscription page */}
          <li onClick={() => navigate("/subscription")}>Subscription</li>
          <li>Bla Bla</li>
          <li className="profile" onClick={() => setShowSignup(true)}>Profile</li> 
        </ul>
      </nav>

      {/* Show Signup or Login modals */}
      {showSignup && <Signup onClose={() => setShowSignup(false)} />}
      {showLogin && (
        <Login 
          onClose={() => setShowLogin(false)} 
          switchToSignup={() => {
            setShowSignup(true);
            setShowLogin(false);
          }} 
        />
      )}
    </>
  );
};

export default Navbar;
