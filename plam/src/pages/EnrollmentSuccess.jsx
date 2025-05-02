import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function EnrollmentSuccess() {
  const navigate = useNavigate();
  const state = useLocation().state || {};
  const { name, screenshot } = state;
  if (!name || !screenshot) return <div className="min-h-screen flex items-center justify-center"><p>No data found.</p></div>;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-green-50 to-green-100 text-gray-800">
      <Navbar />
      <main className="flex-grow flex flex-col items-center justify-center px-6 py-12">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-md flex flex-col items-center gap-6 p-10">
          <h1 className="text-4xl font-bold">Welcome, {name}!</h1>
          <p className="text-gray-600">Your palm has been successfully enrolled.</p>
          <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-green-500 shadow-lg">
            <img src={screenshot} alt="Palm Profile" className="w-full h-full object-cover" />
          </div>
          <button onClick={()=>navigate('/')} className="mt-6 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700">Go to Home</button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
