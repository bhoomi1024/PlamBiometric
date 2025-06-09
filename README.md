# Palm Secure – Vein-Based Biometric Authentication System

**Palm Secure** is a full-stack web-based biometric authentication system that verifies individuals using unique palm vein patterns. It uses deep learning and image processing techniques for secure, contactless identity verification.

---

## 🚀 Features

- 🔐 Biometric authentication via palm vein recognition  
- 🎯 Deep learning with TensorFlow for accurate classification  
- 📷 Real-time image processing using OpenCV and Pillow  
- ☁️ Cloudinary integration for image storage  
- 🌍 React-based frontend with Flask backend  
- 🛢️ MongoDB for data storage and retrieval  
- 🔄 Secure CORS-enabled API for frontend-backend communication  

---

## 🛠 Tech Stack

**Frontend:** React.js  
**Backend:** Flask, Flask-CORS, pymongo, python-dotenv  
**ML & Processing:** OpenCV, TensorFlow, scikit-learn, NumPy, Pillow  
**Storage:** MongoDB, Cloudinary  

---

## 🧪 How It Works

1. User uploads a palm image via the React UI.  
2. Image is processed using OpenCV and Pillow to extract vein patterns.  
3. Processed images are stored in Cloudinary; data is saved in MongoDB.  
4. TensorFlow model authenticates the user based on extracted vein features.  
5. Results are sent back and shown in real-time.  

---

## 🧠 Model Training

- Collected palm vein dataset  
- Preprocessed with OpenCV (grayscale, ROI extraction)  
- Trained CNN model using TensorFlow  
- Evaluated with scikit-learn (accuracy, precision, recall)  

---


## 📸 Screenshots

![Palm Secure UI](src/assets/front.png)

---

## 👩‍💻 Author

**Bhoomi Verma**  
📧 vbhoomi1024@gmail.com  
🔗 [LinkedIn](https://www.linkedin.com/in/bhoomi-verma-0718411a0/)  

---

## 📄 License

This project is licensed under the MIT License.
