import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import scanIllustration from "../assets/logo.png"; // optional image for visual
import Footer from "../components/Footer";

const ScanInstructions = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-blue-50 to-blue-100">
      <Navbar />

      <main className="flex-grow flex items-center justify-center px-6 py-12">
        <div className="bg-white rounded-3xl shadow-xl max-w-3xl w-full flex flex-col md:flex-row items-center gap-10 p-10 border border-blue-100">
          {/* Left Side: Image */}
          <div className="w-full md:w-1/2">
            <img
              src={scanIllustration}
              alt="Palm Scan Instructions"
              className="w-full h-auto object-contain drop-shadow-md"
            />
          </div>

          {/* Right Side: Text */}
          <div className="w-full md:w-1/2 text-center md:text-left">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Get Ready to Scan Your Palm
            </h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              Hold your hand 5–7 cm above the scanner. Keep it steady and make sure the lighting is
              good. This ensures accurate palm vein recognition.
            </p>

            <button
              onClick={() => navigate("/palm-scan")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-full shadow-lg transition-transform transform hover:scale-105 duration-300"
            >
              Start Scanning →
            </button>
          </div>
        </div>
      </main>
      <Footer/>
    </div>
  );
};

export default ScanInstructions;
