import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import * as handsModule from "@mediapipe/hands";
import * as cam from "@mediapipe/camera_utils";

function PalmScan() {
  const webcamRef = useRef(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("enroll");
  const [borderColor, setBorderColor] = useState("border-blue-100");
  const [screenshot, setScreenshot] = useState(null);
  const navigate = useNavigate();
  const lastCaptureTime = useRef(0);
  const handsRef = useRef(null);

  

  const handleResults = (results) => {
    const now = Date.now();
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      setBorderColor("border-red-500");
      setMessage("No hand detected.");
      return;
    }

    const landmarks = results.multiHandLandmarks[0];
    const xs = landmarks.map((l) => l.x);
    const ys = landmarks.map((l) => l.y);
    const minX = Math.min(...xs),
      maxX = Math.max(...xs);
    const minY = Math.min(...ys),
      maxY = Math.max(...ys);

    const isAligned =
      minX >= 0.2 &&
      maxX <= 0.8 &&
      minY >= 0.2 &&
      maxY <= 0.8 &&
      maxY - minY > 0.3;

    if (isAligned) {
      setBorderColor("border-green-500");
      setMessage("Palm aligned!");
      if (now - lastCaptureTime.current > 3000) {
        lastCaptureTime.current = now;
        const img = webcamRef.current.getScreenshot();
        setScreenshot(img);
        if (mode === "enroll") {
          validatePalm(img, name);
        } else {
          LoginvalidatePalm(img);
        }
      }
    } else {
      setBorderColor("border-red-500");
      setMessage("Palm not aligned. Adjust your hand.");
    }
  };

  useEffect(() => {
    const hands = new handsModule.Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    hands.onResults(handleResults);
    handsRef.current = hands;

  if (webcamRef.current?.video) {
      const camera = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          await hands.send({ image: webcamRef.current.video });
        },
        width: 640,
        height: 480,
      });
      camera.start();

      return () => {
        camera.stop();
        hands.close();
      };
    }
  }, [mode , name]);


  const validatePalm = async (img, n) => {
    if (!name.trim()) {
      setMessage("Please enter your name to enroll.");
      return;
    }

    setLoading(true);
    setMessage( "Validating and Enrolling...");

    try {
      const res = await axios.post(
        "http://localhost:5000/validate",
        {
          image: img,
          name: n,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data.valid) {
        setMessage(
          "Enrollment successful"
        );
        if (mode === "enroll") {
          setTimeout(
            () =>
              navigate("/enrollment-success", {
                state: {
                  screenshot: img,
                  name: name,
                  imagePath: res.data.image_path,
                },
              }),
            1000
          );
        }
      } else {
        setMessage(res.data.reason || "Validation failed. Please try again.");
      }
    } catch (e) {
      console.error("API Error:", e);
      setMessage(
        e.response?.data?.reason || "Server error. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };
  const LoginvalidatePalm = async (img) => {
    setLoading(true);
    setMessage( "Validating Login");

    try {
      const res = await axios.post(
        "http://localhost:5000/login-validate",
        {
          image: img,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
if (res.data.success || res.data.valid){
        setMessage(
          "login successful"
        );
        setScreenshot(img);
          setTimeout(() => {
        navigate("/login-successfully", {
          state: {
            screenshot: img,
            user_id: res.data.user_id,
            name: res.data.name,
            
          },
        });
      }, 1000);
      } else {
        setMessage(res.data.reason || "Validation failed. Please try again.");
      }
    } catch (e) {
      console.error("API Error:", e);
      setMessage(e.response?.data?.reason || "Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

   return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-blue-50 to-blue-100 text-gray-800">
      <Navbar />
      <main className="flex-grow flex flex-col items-center justify-center px-6 py-12">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-3xl flex flex-col items-center gap-6 p-10 border border-blue-100">
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => {
                setMode("enroll");
                setMessage("");
              }}
              className={`px-6 py-2 rounded-xl ${
                mode === "enroll"
                  ? "bg-blue-600 text-white"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              Enroll
            </button>
            <button
              onClick={() => {
                setMode("login");
                setMessage("");
                setName("");
              }}
              className={`px-6 py-2 rounded-xl ${
                mode === "login"
                  ? "bg-blue-600 text-white"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              Login
            </button>
          </div>

          {mode === "enroll" && (
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              name="name"
              autoComplete="true"
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 border border-blue-100 rounded-xl"
            />
          )}

          <div
            className={`relative w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden shadow-md border-4 ${borderColor}`}
          >
            <Webcam
              ref={webcamRef}
              className="absolute inset-0 w-full h-full object-cover"
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: "user" }}
              mirrored={true}
            />
            <img
              src="/palm-outline.png"
              alt="Guide"
              className="absolute w-96 md:w-[480px] opacity-70 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            />
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold mb-3">
              {mode === "enroll"
                ? "Show Open Palm to Enroll"
                : "Show Open Palm to Login"}
            </h2>
            <p className="text-lg text-gray-600">
              Hold hand 5-7cm away, open palm.
            </p>
          </div>

          {loading && (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {message && (
            <p
              className={`text-sm text-center ${
                message.includes("success") ? "text-green-600" : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default PalmScan;


