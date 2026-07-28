# save as check_yolo_dataset.py and run with python
import os
import yaml
import csv
from PIL import Image, UnidentifiedImageError
from collections import defaultdict, Counter
import matplotlib.pyplot as plt

DATA_YAML = r"D:\AI\face_care_system\ml\data\data.yaml"  # sửa lại nếu cần
OUT_CSV = "dataset_issues.csv"

def load_yaml(p):
    with open(p, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)

def resolve_path(base_dir, path):
    if os.path.isabs(path):
        return path
    return os.path.normpath(os.path.join(base_dir, path))

def check_label_line(parts, line_num):
    # YOLO label: class x_center y_center width height (normalized)
    # parts already split by whitespace
    if len(parts) != 5:
        return "wrong_cols"
    try:
        cls = int(parts[0])
        coords = [float(x) for x in parts[1:]]
    except Exception:
        return "parse_error"
    x_c, y_c, w, h = coords
    if w <= 0 or h <= 0:
        return "zero_area"
    # check normalized range (allow tiny eps margin)
    eps = 1e-6
    for v in coords:
        if v < -eps or v > 1+eps:
            return "out_of_range"
    return None  # OK

def main():
    info = load_yaml(DATA_YAML)
    # data.yaml typical keys: train, val, test, names
    base_dir = os.path.dirname(DATA_YAML)
    splits = {}
    for k in ("train","val","test"):
        if k in info:
            splits[k] = resolve_path(base_dir, info[k])
    names = info.get("names") or info.get("nc") and info.get("names")
    if isinstance(names, dict):
        class_names = [names[i] for i in sorted(map(int, names.keys()))]
    elif isinstance(names, list):
        class_names = names
    else:
        class_names = []
    nc = len(class_names)

    issues = []  # list of (file, issue, details)
    per_class_counts = Counter()
    total_images = 0
    total_labels = 0

    for split, list_path in splits.items():
        # list_path could be a folder or a .txt file listing images
        images = []
        if os.path.isfile(list_path) and list_path.lower().endswith((".txt", ".csv")):
            with open(list_path, 'r', encoding='utf-8') as f:
                for line in f:
                    p = line.strip()
                    if not p:
                        continue
                    images.append(resolve_path(base_dir, p))
        elif os.path.isdir(list_path):
            # collect common image extensions
            for root, _, files in os.walk(list_path):
                for fn in files:
                    if fn.lower().endswith((".jpg",".jpeg",".png",".bmp",".tif",".tiff")):
                        images.append(os.path.join(root, fn))
        else:
            issues.append((list_path, "path_not_found", f"split={split}"))
            continue

        for img_path in images:
            total_images += 1
            lbl_path = os.path.splitext(img_path)[0] + ".txt"
            # check image readability
            try:
                with Image.open(img_path) as im:
                    im_w, im_h = im.size
            except FileNotFoundError:
                issues.append((img_path, "image_missing", split))
                continue
            except UnidentifiedImageError:
                issues.append((img_path, "image_corrupt", split))
                continue
            except Exception as e:
                issues.append((img_path, "image_error", str(e)))
                continue

            if not os.path.exists(lbl_path):
                issues.append((img_path, "label_missing", split))
                continue

            # read label file
            with open(lbl_path, 'r', encoding='utf-8') as f:
                lines = [ln.strip() for ln in f if ln.strip()]

            if len(lines) == 0:
                issues.append((lbl_path, "label_empty", split))
                continue

            for i, ln in enumerate(lines, start=1):
                parts = ln.split()
                err = check_label_line(parts, i)
                if err:
                    issues.append((lbl_path, err, f"line={i} content='{ln}'"))
                    continue
                cls = int(parts[0])
                if nc and (cls < 0 or cls >= nc):
                    issues.append((lbl_path, "invalid_class", f"line={i} class={cls} nc={nc}"))
                    continue
                # count per-class
                per_class_counts[cls] += 1
                total_labels += 1

    # write CSV of issues
    with open(OUT_CSV, 'w', newline='', encoding='utf-8') as csvf:
        writer = csv.writer(csvf)
        writer.writerow(["file","issue","details"])
        for row in issues:
            writer.writerow(row)

    # print summary
    print("=== DATASET CHECK SUMMARY ===")
    print(f"data.yaml: {DATA_YAML}")
    print(f"Total images scanned: {total_images}")
    print(f"Total labels found:  {total_labels}")
    print(f"Total issues detected: {len(issues)}  (written to {OUT_CSV})")
    print()
    if per_class_counts:
        print("Per-class counts:")
        for cls, cnt in sorted(per_class_counts.items()):
            name = class_names[cls] if cls < len(class_names) else f"class_{cls}"
            print(f"  {cls}: {name} -> {cnt}")
    else:
        print("No labeled boxes counted (maybe lots of errors).")

    # top 10 problematic files
    if issues:
        from collections import Counter
        files = [r[0] for r in issues]
        cf = Counter(files).most_common(10)
        print("\nTop problematic files:")
        for f,c in cf:
            print(f"  {f} : {c} issues")

    # plot per-class bar chart if classes exist
    if per_class_counts:
        classes = [class_names[i] if i < len(class_names) else str(i) for i in sorted(per_class_counts.keys())]
        counts = [per_class_counts[i] for i in sorted(per_class_counts.keys())]
        plt.figure(figsize=(8,4))
        plt.bar(classes, counts)
        plt.title("Class distribution")
        plt.ylabel("Number of bboxes")
        plt.xticks(rotation=45, ha="right")
        plt.tight_layout()
        plt.show()

if __name__ == "__main__":
    main()
