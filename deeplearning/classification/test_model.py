import numpy as np
import matplotlib.pyplot as plt
from tensorflow import keras
from tensorflow.keras.preprocessing import image
from tensorflow.keras.models import load_model

def test_model(model_path, image_path, target_size, class_names=None):
    model = load_model(model_path)
    img = image.load_img(image_path, target_size=target_size)
    img_array = image.img_to_array(img)
    arr = np.expand_dims(img_array, axis=0)
    arr = keras.applications.efficientnet_v2.preprocess_input(arr)
    prediction = model.predict(arr)
    print(prediction)
    # Lấy class
    predicted_class = np.argmax(prediction, axis=1)[0]
    confidence = np.max(prediction)

    # Hiển thị ảnh
    plt.imshow(img)
    plt.axis("off")

    if class_names:
        result_text = f"Predicted: {class_names[predicted_class]} ({confidence:.2f})"
    else:
        result_text = f"Predicted class: {predicted_class} ({confidence:.2f})"

    plt.title(result_text)
    plt.show()


class_names = ["good", "bad"]

test_model(
    model_path="final_best.keras",
    image_path=r"C:\Users\btran\Downloads\test1.png",
    target_size=(384, 384),
    class_names=class_names
)
