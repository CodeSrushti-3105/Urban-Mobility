import React, { useState } from "react";
import { auth } from "../firebase"; // Import Firebase authentication
import { signInWithEmailAndPassword } from "firebase/auth";
import "./Form.css"; // Common CSS

const Login = ({ switchToSignup, onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage(""); // Reset previous messages

    try {
      // Firebase login authentication
      await signInWithEmailAndPassword(auth, email, password);
      setMessage("Login successful! ✅");
    } catch (error) {
      console.error("Login error:", error.message);

      // Display user-friendly error messages
      if (error.code === "auth/user-not-found") {
        setMessage("❌ No account found with this email. Please sign up.");
      } else if (error.code === "auth/wrong-password") {
        setMessage("❌ Incorrect password. Try again.");
      } else {
        setMessage(`❌ ${error.message}`); // ✅ Fixed template literal issue
      }
    }
  };

  return (
    <div className="form-container">
      {/* Close Button (×) */}
      <span className="close-btn" onClick={onClose}>&times;</span>

      <h2>Login</h2>

      {/* Display success or error message */}
      {message && <p className="message">{message}</p>}

      <form onSubmit={handleLogin}>
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
        <button type="submit">Login</button>
      </form>

      <p>
        Don't have an account?{" "}
        <span className="link" onClick={switchToSignup}>Sign up here</span>
      </p>
    </div>
  );
};

export default Login; 