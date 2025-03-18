import React, { useState, useEffect } from "react";
import { auth } from "../firebase"; // ✅ Import Firebase Auth
import { createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import Login from "./Login";
import "./Signup.css";

const Signup = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLogin, setIsLogin] = useState(false);
  const [user, setUser] = useState(null); // ✅ Track logged-in user

  // ✅ Check if user is already signed in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user); // ✅ Store logged-in user
      } else {
        setUser(null); // No user, show signup
      }
    });

    return () => unsubscribe(); // Cleanup
  }, []);

  // ✅ Handle Signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("User signed up:", userCredential.user);
      alert("Signup successful!");
      setUser(userCredential.user); // ✅ Store user
      onClose(); // Close modal
    } catch (error) {
      console.error("Signup error:", error.message);
      setError(error.message);
    }
  };

  // ✅ Handle Logout
  const handleLogout = async () => {
    await signOut(auth);
    setUser(null); // Clear user state
  };

  return (
    <div className="signup-container">
      <div className="signup-form">
        <span className="close-btn" onClick={onClose}>&times;</span>

        {/* ✅ If user is logged in, show profile */}
        {user ? (
          <>
            <h2>Welcome, {user.email}</h2>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : isLogin ? (
          <Login switchToSignup={() => setIsLogin(false)} />
        ) : (
          <>
            <h2>Sign Up</h2>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleSignup}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit">Create Account</button>
            </form>
            <p>
              Already have an account?{" "}
              <span className="login-link" onClick={() => setIsLogin(true)}>Login here</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Signup;
