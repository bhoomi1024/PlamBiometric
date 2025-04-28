import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const EnrollmentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { screenshot, name } = location.state || {}; // Destructure name and screenshot from state

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-white text-gray-800">
      <Navbar />
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="bg-white border border-green-200 shadow-lg rounded-3xl p-10 w-full max-w-2xl flex flex-col items-center text-center space-y-6">
          
          {/* Success Icon */}
          <div className="bg-green-100 p-4 rounded-full">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Headline */}
          <h1 className="text-3xl font-bold text-green-700">Enrollment Successful</h1>

          {/* Name Display */}
          {name && (
            <p className="text-gray-600 text-lg">Welcome, {name}!</p> // Display name
          )}

          {/* Description */}
          <p className="text-gray-600 text-lg">
            Your palm has been scanned and successfully enrolled. Thank you!
          </p>

          {/* Captured Image */}
          {screenshot && (
            <div className="border-4 border-green-300 rounded-xl overflow-hidden shadow-md">
              <img
                src={screenshot}
                alt="Captured Palm"
                className="w-64 h-64 object-cover"
              />
            </div>
          )}

          {/* Button */}
          <button
            onClick={() => navigate("/")}
            className="mt-6 px-6 py-3 bg-green-600 text-white font-medium rounded-xl shadow hover:bg-green-700 transition-all duration-200"
          >
            Back to Home
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EnrollmentSuccess;
