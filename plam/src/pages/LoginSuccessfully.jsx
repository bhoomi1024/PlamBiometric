import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function LoginSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user_id, name } = location.state || {};

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-blue-50 to-blue-100">
        <Navbar/>
      <div className="flex-grow flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 text-center">
          <h1 className="text-3xl font-bold text-blue-600 mb-6">Login Successful!</h1>
          
          <div className="space-y-4 mb-8">
            <div>
              <p className="text-gray-600">Name:</p>
              <p className="text-xl font-medium">{name}</p>
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Return to Home
          </button>
        </div>
      </div>
      <Footer/>
    </div>
  );
}

export default LoginSuccess;