import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.preprocessing.image import ImageDataGenerator

IMG_SIZE = 384
BATCH_SIZE = 8
EPOCHS = 100
NUM_CLASSES = 2

train_dir = "data/dataset/train"
val_dir = "data/dataset/val"

# ============================================================
# Data Generator — rescale 1/255 (không dùng pretrained nên không
# cần preprocess_input của EfficientNet)
# ============================================================
train_datagen = ImageDataGenerator(
    rescale=1.0 / 255,
    rotation_range=15,
    zoom_range=0.1,
    horizontal_flip=True,
    width_shift_range=0.1,
    height_shift_range=0.1,
    brightness_range=(0.9, 1.1),
)

val_datagen = ImageDataGenerator(
    rescale=1.0 / 255,
)

train_generator = train_datagen.flow_from_directory(
    train_dir,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode="sparse",
)

val_generator = val_datagen.flow_from_directory(
    val_dir,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode="sparse",
)

# ============================================================
# EfficientNetV2B2 — KHÔNG dùng pretrained (weights=None)
# ============================================================
base_model = keras.applications.EfficientNetV2B2(
    include_top=False,
    weights=None,  # <-- Không dùng ImageNet, train từ đầu
    input_shape=(IMG_SIZE, IMG_SIZE, 3),
)

base_model.trainable = True  # Train toàn bộ từ đầu

model = keras.Sequential([
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.BatchNormalization(),
    layers.Dropout(0.4),
    layers.Dense(NUM_CLASSES, activation="softmax"),
])

model.summary()

model.compile(
    optimizer=keras.optimizers.Adam(1e-3),
    loss=keras.losses.SparseCategoricalCrossentropy(),
    metrics=["accuracy"],
)

callbacks = [
    keras.callbacks.ModelCheckpoint(
        "efficientnet_scratch_best.keras",
        monitor="val_accuracy",
        save_best_only=True,
    ),
    keras.callbacks.EarlyStopping(
        monitor="val_accuracy",
        patience=20,
        restore_best_weights=True,
    ),
    keras.callbacks.ReduceLROnPlateau(
        monitor="val_loss",
        factor=0.5,
        patience=7,
    ),
]

class_weight = {
    0: 1.09,
    1: 0.92,
}

history = model.fit(
    train_generator,
    validation_data=val_generator,
    epochs=EPOCHS,
    callbacks=callbacks,
    class_weight=class_weight,
)

print("✅ EfficientNetV2B2 (no pretrained) training complete.")