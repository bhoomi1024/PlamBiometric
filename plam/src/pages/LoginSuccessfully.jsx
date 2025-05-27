import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CheckCircle } from 'lucide-react'; // Optional icon from Lucide or use any

export default function LoginSuccessfully() {
  const navigate = useNavigate();
  const state = useLocation().state || {};
  const { name, screenshot } = state;

  if (!name || !screenshot) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No login data found. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-green-50 to-green-100 text-gray-800">
      <Navbar />
      <main className="flex-grow flex flex-col items-center justify-center px-6 py-12">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-md flex flex-col items-center gap-6 p-10">
          <CheckCircle className="text-green-600 w-16 h-16 animate-pulse" />
          <h1 className="text-3xl font-bold text-green-700">Login Successful!</h1>
          <p className="text-gray-600 text-center">Welcome back, <span className="font-semibold">{name}</span> 👋</p>
          <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-green-500 shadow-md">
            <img src={screenshot} alt="Palm Profile" className="w-full h-full object-cover" />
          </div>
          <button
            onClick={() => navigate('/')}
            className="mt-6 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-300"
          >
            Go to Home
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}

