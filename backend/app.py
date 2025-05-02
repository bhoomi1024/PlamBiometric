from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import base64
import os
import datetime
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)
CORS(app)

# MongoDB Atlas connection
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client['PalmDB']
collection = db['users']

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/validate', methods=['POST'])
def validate():
    data = request.get_json()
    name = data.get('name')
    image_data = data.get('image')
    if not name or not image_data:
        return jsonify({"valid": False, "reason": "Name or image missing"}), 400

    # Decode the base64 image
    header, encoded = image_data.split(",", 1)
    img_data = base64.b64decode(encoded)
    filename = f"{name}_{datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S')}.jpg"
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    with open(filepath, 'wb') as f:
        f.write(img_data)

    user_doc = {
        "name": name,
        "image_path": filepath,
        "createdAt": datetime.datetime.utcnow()
    }
    collection.insert_one(user_doc)
    return jsonify({"valid": True})

@app.route('/login-validate', methods=['POST'])
def login_validate():
    data = request.get_json()
    image_data = data.get('image')
    if not image_data:
        return jsonify({"valid": False, "reason": "Image missing"}), 400

    # Simulated check — in real life use ML match
    user = collection.find_one()
    if user:
        return jsonify({"valid": True})
    return jsonify({"valid": False, "reason": "No match found"})

@app.route('/user/<name>', methods=['GET'])
def get_user(name):
    user = collection.find_one({"name": name})
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"name": user['name'], "image_path": user['image_path']})

if __name__ == '__main__':
    app.run(debug=True)


