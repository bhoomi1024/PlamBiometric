import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer"

const SuccessScreen = () => {
  const navigate = useNavigate();
  const [capturedImage, setCapturedImage] = useState(null);

  useEffect(() => {
    const savedImage = localStorage.getItem("palmImage");
    if (savedImage) {
      setCapturedImage(savedImage);
    }
  }, []);

  return (
    <div className="min-h-screen w-full bg-white flex flex-col">
      <Navbar />

      <main className="flex-grow flex items-center justify-center px-4">
        <div className="text-center max-w-3xl w-full px-6 py-12 bg-white shadow-2xl border border-green-200 rounded-3xl">
          <h2 className="text-4xl md:text-5xl font-extrabold text-green-600 mb-4">
            Enrollment Successful!
          </h2>
          <p className="text-lg md:text-xl text-gray-600 mb-8">
            Your palm vein pattern has been securely registered. You're all set!
          </p>

          {capturedImage && (
            <div className="mb-8">
              <img
                src={capturedImage}
                alt="Palm Scan"
                className="mx-auto w-64 h-auto rounded-xl shadow-md border border-green-300"
              />
              <p className="text-sm text-gray-500 mt-2">Scanned Palm Image</p>
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg transition-all duration-300"
            >
              Go to Dashboard →
            </button>
          </div>
        </div>
      </main>
      <Footer/>
    </div>
  );
};

export default SuccessScreen;
