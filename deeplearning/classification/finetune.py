import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.preprocessing.image import ImageDataGenerator

IMG_SIZE = 384
BATCH_SIZE = 8
EPOCHS = 100

train_dir = "data/dataset/train"
val_dir = "data/dataset/val"

# Data generator (giống phase 1)
train_datagen = ImageDataGenerator(
    preprocessing_function=keras.applications.efficientnet_v2.preprocess_input,
    brightness_range=(0.9, 1.1)
)

val_datagen = ImageDataGenerator(
    preprocessing_function=keras.applications.efficientnet_v2.preprocess_input
)

train_generator = train_datagen.flow_from_directory(
    train_dir,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode="sparse"
)

val_generator = val_datagen.flow_from_directory(
    val_dir,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode="sparse"
)

# 🔥 Load model đã train xong phase 1
model = keras.models.load_model("phase1_best100epoch.keras")

# Lấy backbone
base_model = model.layers[0]

# Mở khóa toàn bộ backbone
base_model.trainable = True

# Compile lại với LR nhỏ hơn
model.compile(
    optimizer=keras.optimizers.Adam(1e-5),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

callbacks = [
    keras.callbacks.ModelCheckpoint(
        "final_bestResNet.keras",
        monitor="val_accuracy",
        save_best_only=True
    )
]

model.fit(
    train_generator,
    validation_data=val_generator,
    epochs=EPOCHS,
    callbacks=callbacks,
)

print("🔥 Fine-tuning complete.")