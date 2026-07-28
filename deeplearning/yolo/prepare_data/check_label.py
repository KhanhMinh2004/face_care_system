import cv2
import os
import random
from ultralytics import YOLO
from ultralytics.data.utils import check_det_dataset

def check_label(image_dir, label_dir):
    num_images_to_show = 100

    # 📁 Lấy danh sách ảnh
    image_files = [f for f in os.listdir(image_dir) if f.endswith(('.jpg', '.png', '.jpeg'))]
    random.shuffle(image_files)

    # Giảm số ảnh nếu ít hơn giới hạn
    image_files = image_files[:min(num_images_to_show, len(image_files))]

    # 🎨 Màu sắc cho từng class ID
    colors = {
        0: (0, 255, 0),     # Xanh lá
        1: (255, 0, 0),     # Đỏ
        2: (0, 255, 255),   # Vàng
        3: (255, 0, 255)    # Tím (nếu có thêm class)
    }

    # 🔁 Lặp qua từng ảnh
    for img_file in image_files:
        img_path = os.path.join(image_dir, img_file)
        label_path = os.path.join(label_dir, os.path.splitext(img_file)[0] + '.txt')

        img = cv2.imread(img_path)
        if img is None:
            print(f"⚠️ Không đọc được ảnh: {img_file}")
            continue

        h, w = img.shape[:2]

        # Nếu không có file nhãn thì bỏ qua
        if not os.path.exists(label_path):
            print(f"⚠️ Không có nhãn cho ảnh: {img_file}")
            continue

        # Đọc từng dòng trong file label
        with open(label_path, 'r') as f:
            for line in f:
                parts = line.strip().split()
                if len(parts) != 5:
                    continue

                cls_id, x, y, bw, bh = map(float, parts)
                x1, y1 = int((x - bw/2) * w), int((y - bh/2) * h)
                x2, y2 = int((x + bw/2) * w), int((y + bh/2) * h)

                color = colors.get(int(cls_id), (255, 255, 255))
                cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)
                cv2.putText(img, f"cls {int(cls_id)}", (x1, y1 - 5),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

        # Hiển thị ảnh
        cv2.imshow('YOLO Label Preview', img)

        # Nhấn Enter (13) hoặc mũi tên phải (2555904) để qua ảnh tiếp
        key = cv2.waitKey(0)
        if key == 27:  # ESC -> thoát
            break

    cv2.destroyAllWindows()

def stat_data(data_dir):
    model = YOLO(r"yolo11n.pt")
    model.data = data_dir
    model.info(verbose=True)

# ⚙️ Thay các đường dẫn dưới đây bằng thư mục của bạn
image_dir = r"/ml/data/valid/images"
label_dir = r"/ml/data/valid/labels"

# check_label(image_dir, label_dir)
# stat_data(r"D:\AI\face_care_system\ml\data\data.yaml")
