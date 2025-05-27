from tensorflow.keras.preprocessing import image
from model import feature_extractor
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
import numpy as np
from PIL import Image
import io
from sklearn.metrics.pairwise import cosine_similarity
import base64

def base64_to_image(base64_str):
    img_data = base64.b64decode(base64_str.split(',')[1])
    return Image.open(io.BytesIO(img_data)).convert('RGB')

def extract_vector(img_pil):
    img_pil = img_pil.resize((224, 224))
    img_array = image.img_to_array(img_pil)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)
    vector = feature_extractor.predict(img_array)[0]
    return vector.tolist()

def compare_vectors(vec1, vec2):
    sim = cosine_similarity([vec1], [vec2])[0][0]
    return sim
