import React, { useState } from "react";
import { auth} from "../firebase"; // ✅ Correctly import auth
import { createUserWithEmailAndPassword } from "firebase/auth";
import Login from "./Login";
import "./Signup.css";

const Signup = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLogin, setIsLogin] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("User signed up:", userCredential.user);
      alert("Signup successful!");
      onClose(); // Close modal after signup
    } catch (error) {
      console.error("Signup error:", error.message);
      setError(error.message);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-form">
        <span className="close-btn" onClick={onClose}>&times;</span>
        {isLogin ? (
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
