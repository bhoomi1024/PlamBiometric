import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import welcomePageImage from "/Users/bhoomiverma/Desktop/palmVein/plam/src/assets/welcomepage.png";


const WelcomeScreen = () => {
  const navigate = useNavigate();
 return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-blue-50 to-blue-100">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-6 py-10">
        <div className="flex flex-col-reverse md:flex-row items-center gap-10 max-w-6xl w-full">
          
          {/* Left Text Section */}
          <div className="text-center md:text-left w-full md:w-1/2">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 leading-tight mb-4">
              Secure Your Login
            </h2>
            <p className="text-lg md:text-xl text-gray-600 mb-6">
              Register your unique vein pattern for a safer and faster login experience with PalmSecure.
            </p>
            <button
              onClick={() => navigate("/scan-instructions")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-full shadow-lg transition duration-300"
            >
              Get Started →
            </button>
          </div>

          {/* Right Image Section */}
          <div className="w-full md:w-1/2">
            <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden">
              <img
                src={welcomePageImage}
                alt="Palm scan"
                loading="lazy"
                className="w-full h-auto object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
          </div>
        </div>
        
      </main>
      <Footer/>
    </div>
  );
};

export default WelcomeScreen;
