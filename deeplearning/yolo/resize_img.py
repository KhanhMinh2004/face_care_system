import os
import cv2
from tqdm import tqdm

INPUT_IMG_DIR = "data/valid/images"
INPUT_LABEL_DIR = "data/valid/labels"

OUTPUT_IMG_DIR = "dataset_resized640/valid/images"
OUTPUT_LABEL_DIR = "dataset_resized640/valid/labels"

IMG_SIZE = 640

os.makedirs(OUTPUT_IMG_DIR, exist_ok=True)
os.makedirs(OUTPUT_LABEL_DIR, exist_ok=True)


def letterbox_with_bbox(img, labels, new_size=640):
    h, w = img.shape[:2]

    # scale
    scale = min(new_size / h, new_size / w)
    nh, nw = int(h * scale), int(w * scale)

    img_resized = cv2.resize(img, (nw, nh), interpolation=cv2.INTER_LINEAR)

    # padding
    top = (new_size - nh) // 2
    left = (new_size - nw) // 2

    img_padded = cv2.copyMakeBorder(
        img_resized,
        top, new_size - nh - top,
        left, new_size - nw - left,
        cv2.BORDER_CONSTANT,
        value=(114, 114, 114)
    )

    new_labels = []

    for cls, x, y, bw, bh in labels:
        # convert to pixel (old image)
        x *= w
        y *= h
        bw *= w
        bh *= h

        # apply scale
        x *= scale
        y *= scale
        bw *= scale
        bh *= scale

        # apply padding
        x += left
        y += top

        # normalize lại theo ảnh mới
        x /= new_size
        y /= new_size
        bw /= new_size
        bh /= new_size

        new_labels.append([cls, x, y, bw, bh])

    return img_padded, new_labels


for img_name in tqdm(os.listdir(INPUT_IMG_DIR)):
    img_path = os.path.join(INPUT_IMG_DIR, img_name)
    label_path = os.path.join(INPUT_LABEL_DIR, img_name.replace(".jpg", ".txt"))

    img = cv2.imread(img_path)
    if img is None:
        continue

    labels = []
    if os.path.exists(label_path):
        with open(label_path, "r") as f:
            for line in f.readlines():
                cls, x, y, bw, bh = map(float, line.strip().split())
                labels.append([cls, x, y, bw, bh])

    img_out, new_labels = letterbox_with_bbox(img, labels, IMG_SIZE)

    # save image
    cv2.imwrite(os.path.join(OUTPUT_IMG_DIR, img_name), img_out)

    # save label mới
    with open(os.path.join(OUTPUT_LABEL_DIR, img_name.replace(".jpg", ".txt")), "w") as f:
        for lab in new_labels:
            f.write(" ".join(map(str, lab)) + "\n")

print("✅ Done resize + fix bbox")