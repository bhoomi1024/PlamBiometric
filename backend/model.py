from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, GlobalAveragePooling2D
from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input
from tensorflow.keras.preprocessing import image
import numpy as np

# Use MobileNetV2 as a feature extractor
model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
model.trainable = False

# Add global average pooling to get a vector
from tensorflow.keras.models import Model
from tensorflow.keras.layers import GlobalAveragePooling2D

output = GlobalAveragePooling2D()(model.output)
feature_extractor = Model(inputs=model.input, outputs=output)
