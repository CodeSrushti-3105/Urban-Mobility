import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase"; // ✅ Import Firestore
import { createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore"; // ✅ Import Firestore methods
import Login from "./Login";
import "./Signup.css";

const Signup = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLogin, setIsLogin] = useState(false);
  const [user, setUser] = useState(null); // ✅ Track logged-in user
  const [subscriptions, setSubscriptions] = useState([]); // ✅ Store multiple subscriptions

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await fetchSubscriptions(user.uid); // ✅ Fetch all subscriptions
      } else {
        setUser(null);
        setSubscriptions([]); // Clear subscriptions when logged out
      }
    });

    return () => unsubscribe(); // Cleanup
  }, []);

  // ✅ Fetch all user subscriptions from Firestore
  const fetchSubscriptions = async (userId) => {
    try {
      const subscriptionsRef = collection(db, "subscriptions");
      const q = query(subscriptionsRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);

      const subscriptionList = [];
      querySnapshot.forEach((doc) => {
        subscriptionList.push({ id: doc.id, ...doc.data() }); // ✅ Include subscription ID for deletion
      });

      setSubscriptions(subscriptionList);
    } catch (error) {
      console.error("❌ Error fetching subscriptions:", error);
    }
  };

  // ✅ Delete Subscription
  const handleDeleteSubscription = async (subscriptionId) => {
    try {
      await deleteDoc(doc(db, "subscriptions", subscriptionId));
      setSubscriptions(subscriptions.filter((sub) => sub.id !== subscriptionId));
      alert("Subscription deleted successfully!");
    } catch (error) {
      console.error("❌ Error deleting subscription:", error);
      alert("Failed to delete subscription. Try again.");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("✅ User signed up:", userCredential.user);
      alert("Signup successful!");
      setUser(userCredential.user);
      onClose();
    } catch (error) {
      console.error("❌ Signup error:", error.message);
      setError(error.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setSubscriptions([]); // Clear subscriptions
  };

  return (
    <div className="signup-container">
      <div className="signup-form">
        <span className="close-btn" onClick={onClose}>&times;</span>

        {/* ✅ Show Profile & Subscriptions if logged in */}
        {user ? (
          <>
            <h2>Welcome, {user.email}</h2>
            <button onClick={handleLogout}>Logout</button>

            {/* ✅ Subscription Section */}
            <h3>Your Subscriptions</h3>
            {subscriptions.length > 0 ? (
              <div className="subscriptions-grid">
                {subscriptions.map((sub) => (
                  <div className="subscription-card" key={sub.id}>
                    <h4>🚗 {sub.vehicleName}</h4>
                    <p>👨‍✈️ Needs Driver: {sub.needsDriver ? "Yes" : "No"}</p>
                    <p>✅ Status: {sub.authorized ? "Authorized ✅" : "Pending ⏳"}</p>
                    
                    {/* ✅ Delete Button */}
                    <button className="delete-btn" onClick={() => handleDeleteSubscription(sub.id)}>
                      🗑️ Delete
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p>No active subscriptions.</p>
            )}
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
