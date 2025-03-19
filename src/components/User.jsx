import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, doc, setDoc, updateDoc, getDoc, deleteDoc } from "firebase/firestore";
import "./User.css";

const User = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showTerms, setShowTerms] = useState(false);
  const [needsDriver, setNeedsDriver] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userAddress, setUserAddress] = useState("");

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
      }
    });

    const fetchVehicles = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "vehicles"));
        const vehicleList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setVehicles(vehicleList);
      } catch (error) {
        console.error("❌ Error fetching vehicles:", error);
      }
    };

    fetchVehicles();
  }, []);

  const handleSubscribe = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowTerms(true);
    setNeedsDriver(null);
  };

  const handleAcceptTerms = () => {
    setShowTerms(false);
    setNeedsDriver(null);
  };

  const handleDriverChoice = (choice) => {
    setNeedsDriver(choice);
    if (choice === "yes") {
      authorizeUser();
    } else {
      setIsAuthorized(false);
    }
  };

  const handleLicenseUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsAuthorized(true);
      authorizeUser();
    }
  };

  const authorizeUser = async () => {
    if (!userId) {
      alert("❌ Please log in to subscribe.");
      return;
    }

    if (!userEmail || !userName || !userAddress) {
      alert("❌ Please fill in all details.");
      return;
    }

    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        await updateDoc(userRef, { 
          authorized: true, 
          email: userEmail,  
          name: userName,
          address: userAddress,
          vehicleId: selectedVehicle.id,  // ✅ Store vehicle details
          vehicleName: selectedVehicle.vehicleName,
        });
      } else {
        await setDoc(userRef, {
          userId,
          email: userEmail,
          name: userName,
          address: userAddress,
          authorized: true,
          vehicleId: selectedVehicle.id,  // ✅ Store vehicle details
          vehicleName: selectedVehicle.vehicleName,
        });
      }

      await setDoc(doc(db, "subscriptions", userId), {
        userId,
        email: userEmail,
        vehicleId: selectedVehicle.id,
        vehicleName: selectedVehicle.vehicleName,
        needsDriver: needsDriver === "yes",
        authorized: true,
        timestamp: new Date(),
      });

      // 🔥 Remove the vehicle from the "vehicles" collection
      await deleteDoc(doc(db, "vehicles", selectedVehicle.id));

      alert("✅ Subscription Successful! Vehicle removed from available list.");
      setSelectedVehicle(null); 
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
            <div key={vehicle.id} className="vehicle-card">
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

      {showTerms && (
        <div className="popup">
          <h3>Terms & Conditions</h3>
          <p>By subscribing, you agree to our rental policies...</p>
          <button onClick={handleAcceptTerms}>Accept</button>
        </div>
      )}

      {needsDriver === null && !showTerms && selectedVehicle && (
        <div className="popup">
          <h3>Enter Your Details</h3>
          <input
            type="text"
            placeholder="Full Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Enter Your Email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
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
