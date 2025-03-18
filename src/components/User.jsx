import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase"; // ✅ Ensure auth is correctly imported
import { collection, getDocs, doc, setDoc, updateDoc, getDoc } from "firebase/firestore";
import "./User.css";

const User = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showTerms, setShowTerms] = useState(false);
  const [needsDriver, setNeedsDriver] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [userName, setUserName] = useState("");
  const [userAddress, setUserAddress] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      auth.onAuthStateChanged((user) => {
        if (user) {
          setUserId(user.uid);
          setUserEmail(user.email);
          console.log(`✅ User logged in: ${user.uid}`);
        } else {
          console.warn("⚠️ No user logged in");
        }
      });
    };

    const fetchVehicles = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "vehicles"));
        const vehicleList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setVehicles(vehicleList);
        console.log(`🚗 Fetched ${vehicleList.length} vehicles.`);
      } catch (error) {
        console.error("❌ Error fetching vehicles:", error);
      }
    };

    fetchUser();
    fetchVehicles();
  }, []);

  // Handle Subscribe Click
  const handleSubscribe = (vehicle) => {
    console.log(`🚀 Subscribing to vehicle: ${vehicle.vehicleName}, ID: ${vehicle.id}`);
    
    setSelectedVehicle(vehicle);  // ✅ Ensure state updates
    setShowTerms(true);           // ✅ Show terms popup
    setNeedsDriver(null);         // ✅ Reset driver choice
  };

  // Handle Accept Terms
  const handleAcceptTerms = () => {
    setShowTerms(false);
    setNeedsDriver(null);
  };

  // Handle Driver Choice
  const handleDriverChoice = (choice) => {
    setNeedsDriver(choice);
    if (choice === "yes") {
      authorizeUser();
    } else {
      setIsAuthorized(false);
    }
  };

  // Handle License Upload (without storing)
  const handleLicenseUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("📄 License uploaded:", file.name);
      setIsAuthorized(true);
      authorizeUser();
    }
  };

  // Update Firestore with Subscription Details
  const authorizeUser = async () => {
    if (!userId) {
      alert("Please log in to subscribe.");
      return;
    }

    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        await updateDoc(userRef, { authorized: true });
        console.log(`✅ User ${userId} updated in Firestore`);
      } else {
        await setDoc(userRef, {
          userId,
          email: userEmail,
          name: userName,
          address: userAddress,
          authorized: true,
        });
        console.log(`📌 New user created in Firestore: ${userId}`);
      }

      // Store Subscription Details in Firestore
      await setDoc(doc(db, "subscriptions", userId), {
        userId,
        email: userEmail,
        vehicleId: selectedVehicle.id,
        vehicleName: selectedVehicle.vehicleName,
        needsDriver: needsDriver === "yes",
        authorized: true,
        timestamp: new Date(),
      });

      alert("✅ You are authorized!");
    } catch (error) {
      console.error("❌ Error updating Firestore:", error);
    }
  };

  return (
    <div>
      <h2>Available Vehicles</h2>
      <div>
        {vehicles.length > 0 ? (
          vehicles.map((vehicle) => (
            <div key={vehicle.id} style={{ border: "1px solid black", padding: "10px", margin: "10px" }}>
              <h3>{vehicle.vehicleName}</h3>
              <p>Model: {vehicle.model}</p>
              <p>Availability: {vehicle.availability}</p>
              <p>Price per Day: ₹{vehicle.price}</p>
              <p>Contact: {vehicle.contact}</p>
              <button onClick={() => handleSubscribe(vehicle)}>Subscribe</button>
            </div>
          ))
        ) : (
          <p>No vehicles available.</p>
        )}
      </div>

      {/* Terms & Conditions Popup */}
      {showTerms && (
        <div className="popup">
          <h3>Terms & Conditions</h3>
          <p>By subscribing, you agree to our rental policies...</p>
          <button onClick={handleAcceptTerms}>Accept</button>
        </div>
      )}

      {/* Subscription Form */}
      {needsDriver === null && !showTerms && selectedVehicle && (
  <div className="popup">
    {console.log("📌 Rendering Subscription Form for:", selectedVehicle.vehicleName)}
    <h3>Enter Your Details</h3>
    <input
      type="text"
      placeholder="Full Name"
      value={userName}
      onChange={(e) => setUserName(e.target.value)}
    />
    <input
      type="email"
      placeholder="Email"
      value={userEmail}
      readOnly
    />
    <input
      type="text"
      placeholder="Address"
      value={userAddress}
      onChange={(e) => setUserAddress(e.target.value)}
    />
    <h3>Do you need a driver?</h3>
    <button onClick={() => handleDriverChoice("yes")}>Yes</button>
    <button onClick={() => handleDriverChoice("no")}>No</button>
  </div>
)}


      {/* License Upload Popup */}
      {needsDriver === "no" && !isAuthorized && (
        <div className="popup">
          <h3>Upload Your Driving License</h3>
          <input type="file" accept="image/*,application/pdf" onChange={handleLicenseUpload} />
        </div>
      )}
    </div>
  );
};

export default User;
