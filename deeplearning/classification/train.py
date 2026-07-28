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

# Data generator
train_datagen = ImageDataGenerator(
    preprocessing_function=keras.applications.efficientnetv2b2.preprocess_input,
    brightness_range=(0.9, 1.1)
)

val_datagen = ImageDataGenerator(
    preprocessing_function=keras.applications.efficientnetv2b2.preprocess_input,
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

# Load pretrained model
base_model = keras.applications.EfficientNetV2B2(
    include_top=False,
    weights="imagenet",
    input_shape=(IMG_SIZE, IMG_SIZE, 3)
)

base_model.trainable = False  # Freeze backbone

model = keras.Sequential([
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.BatchNormalization(),
    layers.Dropout(0.4),
    layers.Dense(NUM_CLASSES, activation="softmax")
])

loss_fn = keras.losses.SparseCategoricalCrossentropy()

model.compile(
    optimizer=keras.optimizers.Adam(1e-4),
    loss=loss_fn,
    metrics=["accuracy"]
)

callbacks = [
    keras.callbacks.ModelCheckpoint(
        "phase1_best100epoch_withResNet.keras",
        monitor="val_accuracy",
        save_best_only=True
    ),
    keras.callbacks.EarlyStopping(
        monitor="val_accuracy",
        patience=20,
        restore_best_weights=True
    ),
    keras.callbacks.ReduceLROnPlateau(
        monitor="val_loss",
        factor=0.5,
        patience=10
    )
]

model.fit(
    train_generator,
    validation_data=val_generator,
    epochs=EPOCHS,
    callbacks=callbacks,
)

print("✅ Phase 1 training complete.")