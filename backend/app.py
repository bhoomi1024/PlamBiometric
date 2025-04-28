from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
import mediapipe as mp
import time

app = Flask(__name__)
CORS(app)

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=True, max_num_hands=1)

@app.route('/validate', methods=['POST'])
def validate_palm():
    data = request.get_json()

    # Decode the base64 image
    img_data = data['image'].split(',')[1]
    img_bytes = base64.b64decode(img_data)
    img_array = np.frombuffer(img_bytes, np.uint8)
    frame = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

    # Process the image to find hands
    results = hands.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

    if results.multi_hand_landmarks:
        landmarks = results.multi_hand_landmarks[0]

        # Check if the palm is open (basic heuristic based on y-coordinates spread)
        y_coords = [lm.y for lm in landmarks.landmark]
        x_coords = [lm.x for lm in landmarks.landmark]
        is_open = max(y_coords) - min(y_coords) > 0.3  # Adjust threshold if needed

        # Check alignment of palm (within the outline boundary)
        min_x = min(x_coords)
        max_x = max(x_coords)
        min_y = min(y_coords)
        max_y = max(y_coords)

        # Palm aligned if within bounds (simulating the outline check)
        if 0.2 <= min_x and max_x <= 0.8 and 0.2 <= min_y and max_y <= 0.8 and is_open:
            # Save the image
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            filename = f"screenshot_{int(time.time())}.png"
            cv2.imwrite(filename, gray)

            return jsonify({'valid': True})
        else:
            return jsonify({'valid': False})
    else:
        return jsonify({'valid': False})

if __name__ == '__main__':
    app.run(debug=True)
