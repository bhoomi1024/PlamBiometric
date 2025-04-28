import React from "react";

const Footer = () => {
  return (
    <footer className="bg-white text-center py-4 shadow-inner mt-8">
      <p className="text-gray-500">&copy; {new Date().getFullYear()} PalmSecure. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
