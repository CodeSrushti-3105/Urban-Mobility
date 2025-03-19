import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase"; // Firestore setup
import { createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore"; // Firestore methods
import Login from "./Login";
import "./Signup.css";

const Signup = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLogin, setIsLogin] = useState(false);
  const [user, setUser] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]); // Stores user subscriptions

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await fetchSubscriptions(user.uid);
      } else {
        setUser(null);
        setSubscriptions([]); // Clear subscriptions when logged out
      }
    });

    return () => unsubscribe(); // Cleanup
  }, []);

  // ✅ Fetch user subscriptions
  const fetchSubscriptions = async (userId) => {
    try {
      const subscriptionsRef = collection(db, "subscriptions");
      const q = query(subscriptionsRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);

      const subscriptionList = [];
      querySnapshot.forEach((doc) => {
        subscriptionList.push({ id: doc.id, ...doc.data() }); // Include `id` for deletion
      });

      setSubscriptions(subscriptionList);
    } catch (error) {
      console.error("❌ Error fetching subscriptions:", error);
    }
  };

  // ✅ Unsubscribe (Delete from "subscriptions" and update "vehicles")
  const handleUnsubscribe = async (subscriptionId, vehicleId) => {
    try {
      // 1️⃣ Delete the subscription
      await deleteDoc(doc(db, "subscriptions", subscriptionId));

      // 2️⃣ Update vehicle availability to "Yes" (so it's visible in users section)
      const vehicleRef = doc(db, "vehicles", vehicleId);
      await updateDoc(vehicleRef, { availability: "Yes" });

      // 3️⃣ Update UI immediately
      setSubscriptions((prev) => prev.filter((sub) => sub.id !== subscriptionId));

      alert("Unsubscribed successfully!");
    } catch (error) {
      console.error("❌ Error unsubscribing:", error);
      alert("Failed to unsubscribe. Try again.");
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
                    <button
                      className="delete-btn"
                      onClick={() => handleUnsubscribe(sub.id, sub.vehicleId)}
                    >
                      🗑️ Unsubscribe
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
