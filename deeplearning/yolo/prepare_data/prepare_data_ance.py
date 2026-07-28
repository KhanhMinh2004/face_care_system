import cv2
import os
import shutil
import numpy as np
import pandas as pd
from glob import glob
from ultralytics import YOLO

def convert_csv_to_yolo(csv_path, output_dir):
    df = pd.read_csv(csv_path)
    os.makedirs(output_dir, exist_ok=True)

    # Mapping class sang ID (ví dụ: Acne, Pimple, Spot)
    classes = sorted(df["class"].unique())
    class_to_id = {cls: idx for idx, cls in enumerate(classes)}
    print(f"Class mapping: {class_to_id}")

    for filename, group in df.groupby("filename"):
        lines = []
        img_w = group.iloc[0]["width"]
        img_h = group.iloc[0]["height"]

        for _, row in group.iterrows():
            cls_id = class_to_id[row["class"]]
            # Chuyển từ toạ độ góc sang toạ độ trung tâm + chuẩn hoá
            x_center = ((row["xmin"] + row["xmax"]) / 2) / img_w
            y_center = ((row["ymin"] + row["ymax"]) / 2) / img_h
            w = (row["xmax"] - row["xmin"]) / img_w
            h = (row["ymax"] - row["ymin"]) / img_h

            lines.append(f"{cls_id} {x_center:.8f} {y_center:.8f} {w:.8f} {h:.8f}\n")

        # label_filename = os.path.splitext(filename)[0] + ".txt"
        label_filename = os.path.splitext(os.path.basename(filename))[0] + ".txt"
        label_path = os.path.join(output_dir, label_filename)
        # with open(os.path.join(output_dir, label_filename), "w") as f:
        #     f.writelines(lines)
        with open(label_path, "w") as f:
            f.writelines(lines)
    print(f"✅ Done converting: {csv_path}")

def move_images_to_subfolder(base_dir):
    """
    Di chuyển toàn bộ ảnh .jpg vào thư mục images
    trong từng folder train, valid, test.
    """
    for split in ["train", "valid", "test"]:
        split_dir = os.path.join(base_dir, split)
        image_dir = os.path.join(split_dir, "images")
        os.makedirs(image_dir, exist_ok=True)

        image_paths = glob(os.path.join(split_dir, "*.jpg"))  # ảnh .jpg trong thư mục gốc
        image_paths += glob(os.path.join(split_dir, "*.jpeg"))
        image_paths += glob(os.path.join(split_dir, "*.png"))

        count = 0
        for img_path in image_paths:
            filename = os.path.basename(img_path)
            dst_path = os.path.join(image_dir, filename)

            # Nếu trùng tên, thêm hậu tố
            if os.path.exists(dst_path):
                name, ext = os.path.splitext(filename)
                dst_path = os.path.join(image_dir, f"{name}_dup{count}{ext}")

            shutil.move(img_path, dst_path)
            count += 1

        print(f"✅ Đã di chuyển {count} ảnh sang {image_dir}")

def preprocessing_data(input_dir, output_dir):
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)

    for path in glob(os.path.join(input_dir, '*.jpg')):
        img = cv2.imread(path)

        # Cân bằng sáng nhẹ
        lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        cl = clahe.apply(l)
        limg = cv2.merge((cl, a, b))
        result = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)

        # Giảm nhiễu rất nhẹ
        img = cv2.bilateralFilter(result, 5, 75, 75)

        # --- 1. Gamma correction (làm sáng nhẹ, không mất chi tiết)
        # gamma = 1.1
        # img = np.power(img / 255.0, 1.0 / gamma)
        # img = np.clip(img * 255, 0, 255).astype('uint8')
        #
        # # --- 2. Tăng tương phản cục bộ (CLAHE trên kênh L của LAB)
        # lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
        # l, a, b = cv2.split(lab)
        #
        # clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        # l2 = clahe.apply(l)
        #
        # lab = cv2.merge((l2, a, b))
        # img = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)
        #
        # # --- 3. Lọc nhẹ để giảm noise nhưng vẫn giữ mụn
        # img = cv2.bilateralFilter(img, d=5, sigmaColor=50, sigmaSpace=50)

        # Lưu ảnh
        cv2.imwrite(os.path.join(output_dir, os.path.basename(path)), img)

def crop_face(input_dir, output_dir, conf_thresh=0.2, expand_ratio=0.15):
    face_model = YOLO(r"D:\AI\face_care_system\models\yolov11l-face.pt")
    os.makedirs(output_dir, exist_ok=True)

    cropped_faces = {}
    for img_name in os.listdir(input_dir):
        path = os.path.join(input_dir, img_name)
        img = cv2.imread(path)

        h, w, _ = img.shape
        results = face_model.predict(source=img, conf = conf_thresh, verbose=False)

        if len(results[0].boxes) == 0:
            print(f"❌ Không tìm thấy khuôn mặt trong {img_name}")
            continue

        # lấy khuôn mặt đầu tiên
        x1, y1, x2, y2 = results[0].boxes.xyxy[0].cpu().numpy()

        # mở rộng vùng crop
        pad_x = expand_ratio * (x2 - x1)
        pad_y = expand_ratio * (y2 - y1)
        x1, y1 = max(0, x1 - pad_x), max(0, y1 - pad_y)
        x2, y2 = min(w, x2 + pad_x), min(h, y2 + pad_y)

        face_crop = img[int(y1):int(y2), int(x1):int(x2)]
        cv2.imwrite(os.path.join(output_dir, img_name), face_crop)

        cropped_faces[img_name] = (x1, y1, x2, y2, w, h)

    print("✅ Hoàn tất crop khuôn mặt.")
    return cropped_faces

def adjust_labels_after_crop(input_label_dir, output_label_dir, cropped_faces):
    """
    Cập nhật toạ độ YOLO sau khi crop khuôn mặt.
    """
    os.makedirs(output_label_dir, exist_ok=True)

    for img_name, (x1, y1, x2, y2, w, h) in cropped_faces.items():
        label_path = os.path.join(input_label_dir, os.path.splitext(img_name)[0] + ".txt")
        if not os.path.exists(label_path):
            continue

        new_lines = []
        with open(label_path, "r") as f:
            lines = f.readlines()

        for line in lines:
            cls, x_center, y_center, bw, bh = map(float, line.strip().split())
            x_center *= w
            y_center *= h
            bw *= w
            bh *= h

            # bỏ bbox ngoài vùng khuôn mặt
            if x_center < x1 or x_center > x2 or y_center < y1 or y_center > y2:
                continue

            # chuyển đổi sang ảnh crop
            new_x = (x_center - x1) / (x2 - x1)
            new_y = (y_center - y1) / (y2 - y1)
            new_bw = bw / (x2 - x1)
            new_bh = bh / (y2 - y1)

            new_lines.append(f"{int(cls)} {new_x:.6f} {new_y:.6f} {new_bw:.6f} {new_bh:.6f}\n")

        if new_lines:
            with open(os.path.join(output_label_dir, os.path.splitext(img_name)[0] + ".txt"), "w") as f:
                f.writelines(new_lines)
        else:
            print(f"⚠️ Không còn bbox hợp lệ trong {img_name}")

    print("✅ Hoàn tất cập nhật annotation YOLO.")

# Áp dụng cho 3 thư mục train / valid / test
base_dir = r"/ml/data"
image_dir = r"/ml/data/valid/images"
crop_face_dir = r"/ml/yolo/data\valid\images_cropped"
label_dir = r"/ml/data/valid/labels"
label_cropped_dir = r"/ml/yolo/data\valid\labels_cropped"
# preprocessing_image_dir = r"D:\AI\face_care_system\ml\data\train\images_preprocessed2"
# for split in ["train", "valid", "test"]:
#     csv_file = os.path.join(base_dir, split, "_annotations.csv")
#     label_out = os.path.join(base_dir, split, "labels")
#     convert_csv_to_yolo(csv_file, label_out)

# move_images_to_subfolder(base_dir)

# preprocessing_data(image_dir, preprocessing_image_dir)

cropped_faces = crop_face(image_dir, crop_face_dir)

adjust_labels_after_crop( label_dir, label_cropped_dir, cropped_faces = cropped_faces)