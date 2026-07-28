import cv2

IMG_PATH = r"D:\AI\face_care_system\deeplearning\yolo\dataset_resized\train\images\-_jpg.rf.74d5114d32363e850213b9499d74047a.jpg"
LABEL_PATH = r"D:\AI\face_care_system\deeplearning\yolo\dataset_resized\train\labels\-_jpg.rf.74d5114d32363e850213b9499d74047a.txt"

class_names = ["acne", "spot"]

img = cv2.imread(IMG_PATH)
h, w = img.shape[:2]

with open(LABEL_PATH, "r") as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        cls, x, y, bw, bh = map(float, line.split())
        cls = int(cls)

        # YOLO normalized → pixel
        x1 = int((x - bw / 2) * w)
        y1 = int((y - bh / 2) * h)
        x2 = int((x + bw / 2) * w)
        y2 = int((y + bh / 2) * h)

        cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
        cv2.putText(img, class_names[cls], (x1, y1 - 5),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)

# Hiển thị luôn ra cửa sổ
cv2.imshow("bbox", img)
cv2.waitKey(0)
cv2.destroyAllWindows()