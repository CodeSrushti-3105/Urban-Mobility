import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Subscription from "./components/Subscription";
import Owner from "./components/Owner"; // Import Owner component
import User from "./components/User";
import Driver from "./components/Driver";
import BlaBla from "./components/Blabla"; 


const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<h1>Welcome to Dashboard</h1>} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/blabla" element={<BlaBla />} />
        <Route path="/owner" element={<Owner />} /> 
        <Route path="/user" element={<User />} /> 
        <Route path="/driver" element={<Driver />} /> 
      </Routes>
    </>
  );
};

export default App;
