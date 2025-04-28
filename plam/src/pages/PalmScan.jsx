import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function PalmScan() {
  const webcamRef = useRef(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("enroll"); // "enroll" or "login"
  const [borderColor, setBorderColor] = useState("border-blue-100");
  const [palmAligned, setPalmAligned] = useState(false); // To track if palm is aligned
  const navigate = useNavigate();

  // Function to check alignment of the palm
  const checkPalmAlignment = (landmarks) => {
    // Check if the palm is within the outline based on landmark y-coordinates
    const xCoords = landmarks.map((lm) => lm.x);
    const yCoords = landmarks.map((lm) => lm.y);

    const minX = Math.min(...xCoords);
    const maxX = Math.max(...xCoords);
    const minY = Math.min(...yCoords);
    const maxY = Math.max(...yCoords);

    // Palm is considered aligned if the bounds are within the outline
    if (minX >= 0.2 && maxX <= 0.8 && minY >= 0.2 && maxY <= 0.8) {
      setPalmAligned(true);
      setBorderColor("border-green-500"); // Success (green border)
      setMessage("Palm Aligned!");
    } else {
      setPalmAligned(false);
      setBorderColor("border-red-500"); // Error (red border)
      setMessage("Palm Not Aligned. Adjust your hand.");
    }
  };

  // Capture the image and send it for validation
  const captureAndValidate = async () => {
    const screenshot = webcamRef.current.getScreenshot();
    if (!screenshot || (mode === "enroll" && !name.trim())) {
      setMessage("Please enter your name and show your palm clearly.");
      return;
    }

    setLoading(true);
    setMessage(mode === "enroll" ? "Validating and Enrolling..." : "Validating login...");

    try {
      const endpoint = mode === "enroll" ? "/validate" : "/login-validate";
      const response = await axios.post(`http://localhost:5000${endpoint}`, {
        image: screenshot,
        ...(mode === "enroll" && { name }),
      });

      if (response.data.valid) {
        setMessage(mode === "enroll" ? "Enrollment successful!" : "Login successful!");
        setTimeout(() => {
          navigate("/enrollment-success"); // or navigate("/dashboard") for login
        }, 1500);
      } else {
        setMessage(mode === "enroll" ? "Invalid palm for enrollment. Try again." : "Invalid palm for login. Try again.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error validating palm. Backend offline?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-blue-50 to-blue-100 text-gray-800">
      <Navbar />
      <main className="flex-grow flex flex-col items-center justify-center px-6 py-12">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-3xl flex flex-col items-center gap-6 p-10 border border-blue-100">
          
          {/* Mode Buttons */}
          <div className="flex gap-4 mb-4">
            <button
              className={`px-6 py-2 rounded-xl ${mode === "enroll" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-600"} transition`}
              onClick={() => { setMode("enroll"); setMessage(""); }}
            >
              Enroll
            </button>
            <button
              className={`px-6 py-2 rounded-xl ${mode === "login" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-600"} transition`}
              onClick={() => { setMode("login"); setMessage(""); }}
            >
              Login
            </button>
          </div>

          {/* Show Name input only in Enroll mode */}
          {mode === "enroll" && (
            <input
              type="text"
              className="w-full p-4 border border-blue-100 rounded-xl"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}

          {/* Webcam Section */}
          <div className={`relative w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden shadow-md border-4 ${borderColor} transition-all duration-300`}>
            <Webcam
              ref={webcamRef}
              className="absolute inset-0 w-full h-full object-cover"
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: "user" }}
              onUserMediaError={() => setMessage("Unable to access webcam")}
            />
            <img
              src="/palm-outline.png"
              alt="Palm Guide"
              className="absolute w-96 md:w-[480px] opacity-70 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            />
          </div>

          {/* Instructions */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-3">
              {mode === "enroll" ? "Show Open Palm to Enroll" : "Show Open Palm to Login"}
            </h2>
            <p className="text-lg text-gray-600">Hold hand 5–7 cm away, open palm.</p>
          </div>

          {/* Capture Button */}
          <button
            onClick={captureAndValidate}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition duration-200"
            disabled={loading}
          >
            {loading ? (mode === "enroll" ? "Enrolling..." : "Logging in...") : (mode === "enroll" ? "Enroll Palm" : "Login Palm")}
          </button>

          {/* Message */}
          <p className="text-sm text-center text-red-600">{message}</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default PalmScan;

