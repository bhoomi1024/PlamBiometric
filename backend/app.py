from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import base64
import os
import datetime
import time
from bson.objectid import ObjectId
from PIL import Image
import io

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Configuration
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png'}

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

        # Decode the base64 image and convert to grayscale
        try:
            header, encoded = image_data.split(",", 1)
            binary_data = base64.b64decode(encoded)

            # Open image with PIL
            image = Image.open(io.BytesIO(binary_data))
            grayscale_image = image.convert("L")  # Convert to grayscale
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

        # Save to MongoDB if available
        if collection is not None:
            try:
                user_doc = {
                    "name": name,
                    "image_path": filepath,
                    "createdAt": datetime.datetime.now()
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
            "name": name
        })

    except Exception as e:
        print(f"Validation error: {str(e)}")
        return jsonify({"valid": False, "reason": "Server error"}), 500

@app.route('/login-validate', methods=['POST'])
def login_validate():
    try:
        data = request.get_json()
        image_data = data.get('image')

        if not image_data:
            return jsonify({"valid": False, "reason": "Image missing"}), 400

        if collection is not None:
            user = collection.find_one(sort=[("createdAt", -1)])
            if user:
                return jsonify({
                    "valid": True,
                    "name": user.get('name'),
                    "message": "Login successful"
                })
        
        return jsonify({
            "valid": False,
            "reason": "No matching palm found"
        })

    except Exception as e:
        print(f"Login validation error: {str(e)}")
        return jsonify({"valid": False, "reason": "Server error"}), 500

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
        "createdAt": user.get('createdAt')
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
