import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Subscription from "./components/Subscription";
import Owner from "./components/Owner"; // Import Owner component
import User from "./components/User";

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<h1>Welcome to Dashboard</h1>} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/owner" element={<Owner />} /> {/* Add this route */}
        <Route path="/user" element={<User />} /> {/* Add User Route */}
      </Routes>
    </>
  );
};

export default App;
