import React, { useState } from "react";
import Signup from "./Signup";
import Login from "./Login"; // Import Login component
import "./Navbar.css"; // Make sure you have proper styling

const Navbar = () => {
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false); // State for Login modal

  return (
    <>
      <nav className="navbar">
        <ul className="nav-links">
          <li>Subscription</li>
          <li>Bla Bla</li>
          <li className="profile" onClick={() => setShowSignup(true)}>Profile</li> {/* Opens Login modal */}
        </ul>
      </nav>

      {/* Show Signup or Login modals */}
      {showSignup && <Signup onClose={() => setShowSignup(false)} />}
      {showLogin && <Login onClose={() => setShowLogin(false)} switchToSignup={() => {
       setShowSignup(false);
       setShowLogin(true);
      }} />} {/* Pass onClose to Login */}
    </>
  );
};

export default Navbar;
