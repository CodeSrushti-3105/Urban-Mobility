import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaClipboardList, FaHome } from "react-icons/fa"; // Import icons
import Signup from "./Signup";
import Login from "./Login";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <nav className="navbar">
        <ul className="nav-links">
          {/* Navigate to Subscription Page */}
          <li onClick={() => navigate("/subscription")}>
            <FaClipboardList /> Subscription
          </li>

          {/* Navigate to Bla Bla Page */}
          <li onClick={() => navigate("/blabla")}>
            <FaHome /> Bla Bla
          </li>

          {/* Open Profile (Signup/Login) */}
          <li className="profile" onClick={() => setShowSignup(true)}>
            <FaUserCircle /> Profile
          </li>
        </ul>
      </nav>

      {/* Modals for Signup and Login */}
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
