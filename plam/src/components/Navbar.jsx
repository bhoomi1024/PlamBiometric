import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <header className="w-full flex items-center justify-between px-8 py-4 shadow-md bg-white">
      <div className="flex items-center gap-2">
        <img
          src={logo}
          alt="Handprint Logo"
          className="w-10 h-10 object-contain"
        />
        <h1 className="text-xl font-bold text-gray-800">PalmSecure</h1>
      </div>

      <nav className="hidden md:flex gap-8 text-gray-600 font-medium">
        <a href="#" className="hover:text-gray-900 transition">Features</a>
        <a href="#" className="hover:text-gray-900 transition">How it Works</a>
        <a href="#" className="hover:text-gray-900 transition">Support</a>
      </nav>

      <div className="flex gap-3">
        <button
          onClick={() => navigate("/login")}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-5 py-2 rounded-md shadow"
        >
          Sign In
        </button>
        <button
          onClick={() => navigate("/signup")}
          className="border border-blue-500 hover:bg-blue-100 text-blue-600 font-semibold px-5 py-2 rounded-md shadow"
        >
          Sign Up
        </button>
      </div>
    </header>
  );
};

export default Navbar;