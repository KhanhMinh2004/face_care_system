import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import ImageDataGenerator

from sklearn.metrics import (
    confusion_matrix,
    classification_report,

    precision_score,
    recall_score,
    f1_score,
    accuracy_score
)

# =========================
# 1. LOAD MODEL
# =========================
model = load_model("efficientnet_scratch_best.keras")

# =========================
# 2. LOAD DATA TEST

# =========================
IMG_SIZE = 384
BATCH_SIZE = 8

test_datagen = ImageDataGenerator(
    preprocessing_function=None
)

test_generator = test_datagen.flow_from_directory(
    "data/dataset/test",
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode="sparse",
    shuffle=False   # ⚠️ bắt buộc
)

class_names = list(test_generator.class_indices.keys())
num_classes = len(class_names)

# =========================
# 3. EVALUATE MODEL
# =========================
loss, acc = model.evaluate(test_generator, verbose=1)
print("\n===== MODEL PERFORMANCE =====")
print(f"Test Loss     : {loss:.4f}")
print(f"Test Accuracy : {acc:.4f}")

# =========================
# 4. PREDICT
# =========================
y_pred_probs = model.predict(test_generator, verbose=1)
y_pred = np.argmax(y_pred_probs, axis=1)
y_true = test_generator.classes

# =========================
# 5. CONFUSION MATRIX
# =========================
cm = confusion_matrix(y_true, y_pred)

plt.figure(figsize=(8,6))
sns.heatmap(cm, annot=True, fmt="d", cmap="Blues",
            xticklabels=class_names,
            yticklabels=class_names)
plt.xlabel("Predicted")
plt.ylabel("True")
plt.title("Confusion Matrix")
plt.tight_layout()
plt.show()

# =========================
# 6. CLASSIFICATION REPORT
# =========================
print("\n===== CLASSIFICATION REPORT =====")
report = classification_report(
    y_true,
    y_pred,
    target_names=class_names,
    digits=4
)
print(report)

# =========================
# 7. METRICS TỪNG LỚP
# =========================
precision = precision_score(y_true, y_pred, average=None)
recall = recall_score(y_true, y_pred, average=None)
f1 = f1_score(y_true, y_pred, average=None)

print("\n===== PER-CLASS METRICS =====")
for i, class_name in enumerate(class_names):
    print(f"\nClass: {class_name}")
    print(f"  Precision : {precision[i]:.4f}")
    print(f"  Recall    : {recall[i]:.4f}")
    print(f"  F1-score  : {f1[i]:.4f}")

# =========================
# 8. METRICS TỔNG THỂ
# =========================
precision_macro = precision_score(y_true, y_pred, average='macro')
recall_macro = recall_score(y_true, y_pred, average='macro')
f1_macro = f1_score(y_true, y_pred, average='macro')

precision_weighted = precision_score(y_true, y_pred, average='weighted')
recall_weighted = recall_score(y_true, y_pred, average='weighted')
f1_weighted = f1_score(y_true, y_pred, average='weighted')

print("\n===== OVERALL METRICS =====")
print(f"Accuracy           : {accuracy_score(y_true, y_pred):.4f}")
print(f"Precision (macro)  : {precision_macro:.4f}")
print(f"Recall (macro)     : {recall_macro:.4f}")
print(f"F1-score (macro)   : {f1_macro:.4f}")

print(f"Precision (weighted): {precision_weighted:.4f}")
print(f"Recall (weighted)   : {recall_weighted:.4f}")
print(f"F1-score (weighted) : {f1_weighted:.4f}")

# =========================
# 9. SPECIFICITY
# =========================
print("\n===== SPECIFICITY =====")

# 👉 Nếu NHỊ PHÂN
if num_classes == 2:
    tn, fp, fn, tp = cm.ravel()
    specificity = tn / (tn + fp)
    print(f"Binary Specificity: {specificity:.4f}")

# 👉 Nếu MULTI-CLASS
else:
    specificity_list = []

    for i in range(num_classes):
        tp = cm[i, i]
        fn = np.sum(cm[i, :]) - tp
        fp = np.sum(cm[:, i]) - tp
        tn = np.sum(cm) - (tp + fn + fp)

        specificity = tn / (tn + fp)
        specificity_list.append(specificity)

        print(f"{class_names[i]} - Specificity: {specificity:.4f}")

    print(f"\nAverage Specificity: {np.mean(specificity_list):.4f}")

# =========================
# 10. SAVE RESULTS (OPTIONAL)
# =========================
with open("evaluation_results.txt", "w", encoding="utf-8") as f:
    f.write("=== CLASSIFICATION REPORT ===\n")
    f.write(report)
    f.write("\n\n=== OVERALL METRICS ===\n")
    f.write(f"Accuracy: {accuracy_score(y_true, y_pred):.4f}\n")
    f.write(f"F1 (macro): {f1_macro:.4f}\n")
    f.write(f"F1 (weighted): {f1_weighted:.4f}\n")

print("\n✅ Done evaluation!")