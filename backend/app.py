from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import cloudinary
import cloudinary.uploader
from cloudinary.utils import cloudinary_url
import base64
import os
import datetime
import time
from bson.objectid import ObjectId
from PIL import Image
import io
import numpy as np
import cv2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras.applications import MobileNetV2
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Configuration
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png'}

# Cloudinary config
cloudinary.config(
    cloud_name="foodiebuddy",
    api_key="462752951787628",
    api_secret="RfjLrGYlx7kb-OrSOjR-XylknUI",
    secure=True
)

# Load MobileNetV2 Model
model = MobileNetV2(weights="imagenet", include_top=False, pooling="avg", input_shape=(224, 224, 3))

# MongoDB Connection
def get_mongo_client():
    max_retries = 5
    retry_delay = 2  # seconds
    
    for attempt in range(max_retries):
        try:
            client = MongoClient(
                "mongodb+srv://bhoomi:Bhoomi_123@plam.iog9krm.mongodb.net/?retryWrites=true&w=majority&appName=plam", 
                serverSelectionTimeoutMS=5000,
                socketTimeoutMS=30000,
                connectTimeoutMS=30000
            )
            client.server_info()  # Test connection
            return client
        except Exception as e:
            if attempt == max_retries - 1:
                print(f"Failed to connect to MongoDB after {max_retries} attempts")
                return None
            print(f"Connection attempt {attempt + 1} failed. Retrying in {retry_delay} seconds...")
            time.sleep(retry_delay)

# Initialize MongoDB
collection = None
try:
    client = get_mongo_client()
    if client:
        db = client['PalmDB']
        collection = db['users']
        print("Successfully connected to MongoDB")
    else:
        collection = None
        print("Running without MongoDB - using local storage only")
except Exception as e:
    print(f"MongoDB initialization error: {e}")
    collection = None

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def enhance_vein_image(image):
    gray = np.array(image.convert("L"))
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    enhanced = clahe.apply(gray)
    enhanced_rgb = cv2.cvtColor(enhanced, cv2.COLOR_GRAY2RGB)
    return Image.fromarray(enhanced_rgb)

def get_palm_vein_embedding(image: Image.Image):
    enhanced_image = enhance_vein_image(image)
    resized = enhanced_image.resize((224, 224))
    img_array = np.array(resized).astype("float32")
    img_array = preprocess_input(np.expand_dims(img_array, axis=0))
    embedding = model.predict(img_array)[0]
    return embedding.tolist()

@app.route('/validate', methods=['POST'])
def validate():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"valid": False, "reason": "No data provided"}), 400
            
        name = data.get('name', '').strip()
        image_data = data.get('image')

        if not image_data:
            return jsonify({"valid": False, "reason": "Image missing"}), 400

        if not name:
            return jsonify({"valid": False, "reason": "Name is required"}), 400

        # Check for duplicate user
        if collection is not None:
            existing_user = collection.find_one({"name": name})
            if existing_user:
                return jsonify({
                    "valid": False,
                    "reason": "User with this name already exists"
                }), 400

        # Decode the base64 image
        try:
            header, encoded = image_data.split(",", 1)
            binary_data = base64.b64decode(encoded)
            image = Image.open(io.BytesIO(binary_data))
            grayscale_image = image.convert("L")
        except Exception as e:
            print(f"Image processing error: {e}")
            return jsonify({"valid": False, "reason": "Invalid image data"}), 400
        
        # Save the grayscale image
        timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
        filename = f"{name}_{timestamp}.jpg"
        filepath = os.path.join(UPLOAD_FOLDER, filename)

        try:
            grayscale_image.save(filepath)
        except Exception as e:
            print(f"Image save error: {e}")
            return jsonify({"valid": False, "reason": "Failed to save image"}), 500

        # Upload to Cloudinary
        try:
            cloud_result = cloudinary.uploader.upload(filepath, public_id=f"uploads/{filename}")
            cloud_url = cloud_result.get("secure_url")
        except Exception as e:
            print(f"Cloudinary upload error: {e}")
            return jsonify({"valid": False, "reason": "Cloudinary upload failed"}), 500
        
        # Generate Embedded Vector from Palm Vein
        embedded_vector = get_palm_vein_embedding(image)

        # Save to MongoDB if available
        if collection is not None:
            try:
                user_doc = {
                    "name": name,
                    "image_path": filepath,
                    "cloudinary_url": cloud_url,
                    "embedding": embedded_vector,
                    "createdAt": datetime.datetime.now(),
                    "match": None,
                    "loginHistory": [],
                }
                result = collection.insert_one(user_doc)
                if not result.inserted_id:
                    print("Warning: MongoDB insert didn't return an ID")
            except Exception as e:
                print(f"MongoDB save error: {e}")

        return jsonify({
            "valid": True,
            "message": "Enrollment successful",
            "image_path": filepath,
            "name": name,
            "cloudinary_url": cloud_url,
            "embedding_saved": True
        })

    except Exception as e:
        print(f"Validation error: {str(e)}")
        return jsonify({"valid": False, "reason": "Server error"}), 500

@app.route('/login-validate', methods=['POST'])
def login_validate():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "reason": "No data provided"}), 400
            
        image_data = data.get('image')

        if not image_data:
            return jsonify({"success": False, "reason": "Image missing"}), 400

        # Decode the base64 image
        try:
            header, encoded = image_data.split(",", 1)
            binary_data = base64.b64decode(encoded)
            image = Image.open(io.BytesIO(binary_data))
            grayscale_image = image.convert("L")
        except Exception as e:
            return jsonify({"valid": False, "reason": "Invalid image data"}), 400
        
        # Save login attempt image
        timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
        filename = f"login_attempt_{timestamp}.jpg"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        
        try:
            grayscale_image.save(filepath)
        except Exception as e:
            print(f"Image save error: {e}")
            return jsonify({"valid": False, "reason": "Failed to save image"}), 500

        # Upload to Cloudinary
        try:
            cloud_result = cloudinary.uploader.upload(filepath, public_id=f"uploads/{filename}")
            cloud_url = cloud_result.get("secure_url")
        except Exception as e:
            print(f"Cloudinary upload error: {e}")
            return jsonify({"valid": False, "reason": "Cloudinary upload failed"}), 500
        
        # Generate Embedded Vector from Palm Vein
        query_embedding = get_palm_vein_embedding(image)

        # Compare with stored users
        users = list(collection.find({}))
        best_match = None
        best_score = 0
        best_match_id = None

        for user in users:
            try:
                db_embedding = np.array(user["embedding"])
                if db_embedding.shape[0] == 0:
                    continue
                    
                score = cosine_similarity([query_embedding], [db_embedding])[0][0]
                if score > best_score:
                    best_score = score
                    best_match = user
                    best_match_id = user["_id"]
            except Exception as e:
                print(f"Error comparing with user {user.get('name')}: {str(e)}")
                continue

        print(f"Best match score: {best_score}")

        # If matched (lower threshold to 0.85)
        if best_match and best_score > 0.85:
            
            # Create login record
            login_doc = {
                "type": "login_attempt",
                "image_path": filepath,
                "cloudinary_url": cloud_url,
                "embedding": query_embedding,
                "matched_to": best_match_id,
                "time": datetime.datetime.utcnow(),
                "similarity_score": best_score,
                "status": "success"
            }
            
            # Update user's login history
            update_result = collection.update_one(
                {"_id": best_match_id},
                {
                    "$set": {"lastLogin": datetime.datetime.utcnow()},
                    "$push": {
                        "loginHistory": {
                            "time": datetime.datetime.utcnow(),
                            "image_path": filepath,
                            "cloudinary_url": cloud_url,
                            "similarity_score": best_score,
                            "status": "success"
                        }
                    }
                }
            )

            print(f"Login successful for {best_match['name']} with score {best_score}")
            
            return jsonify({
                "success": True,
                "valid": True,
                "message": "Login successful",
                "name": best_match["name"],
                "match_id": str(best_match_id),
                "similarity_score": best_score,
                "cloudinary_url": best_match.get("cloudinary_url"),
                "login_image_url": cloud_url
            })

        # Even if no match, save the attempt
        login_doc = {
            "type": "login_attempt",
            "image_path": filepath,
            "cloudinary_url": cloud_url,
            "embedding": query_embedding,
            "time": datetime.datetime.utcnow(),
            "similarity_score": best_score,
            "status": "failed"
        }
        collection.insert_one(login_doc)

        return jsonify({
            "valid": False,
            "reason": f"No matching palm found (best score: {best_score:.2f})",
            "login_image_url": cloud_url
        })

    except Exception as e:
        print(f"Login validation error: {str(e)}")
        return jsonify({
            "valid": False,
            "reason": f"Server error: {str(e)}"
        }), 500

@app.route('/user/<name>', methods=['GET'])
def get_user(name):
    if collection is None:
        return jsonify({"error": "Database not available"}), 503
        
    user = collection.find_one({"name": name})
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify({
        "name": user['name'],
        "image_path": user.get('image_path'),
        "cloudinary_url": user.get('cloudinary_url'),
        "embedding": user.get('embedding', []),
        "createdAt": user.get('createdAt'),
        "match": str(user.get("match")) if user.get("match") else None,
        "loginHistory": user.get("loginHistory", [])
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)