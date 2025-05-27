import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WelcomeScreen from "./pages/WelcomePage";
import ScanInstructions from "./pages/ScanInstructor";
import PalmScan from "./pages/PalmScan";
import SuccessScreen from "./pages/SuccessScreen";
import EnrollmentSuccess from "./pages/EnrollmentSuccess";
import LoginSuccessfully from "./pages/LoginSuccessfully";

const App = () => {
  return (
    <Router>
      
        <Routes>
          <Route path="/" element={<WelcomeScreen />} />
          <Route path="/scan-instructions" element={<ScanInstructions />} />
          <Route path="/palm-scan" element={<PalmScan />} />
          <Route path="/success" element={<SuccessScreen />} />
          <Route path="/enrollment-success" element={<EnrollmentSuccess />} />
          <Route path="/login-successfully" element={<LoginSuccessfully/>} />
          
        </Routes>
    
    </Router>
  );
};

export default App;