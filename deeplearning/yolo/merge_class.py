import os
import pandas as pd

INPUT_XLSX = "data/valid/_annotations.csv"
# LABEL_DIR = "data/valid/labels"  # đổi path nếu cần
#
# CLASS_MAP = {
#     0: 0,
#     1: 1,
#     2: 1
# }
#
# for file in os.listdir(LABEL_DIR):
#     if not file.endswith(".txt"):
#         continue
#
#     file_path = os.path.join(LABEL_DIR, file)
#
#     with open(file_path, "r") as f:
#         lines = f.readlines()
#
#     new_lines = []
#     for line in lines:
#         parts = line.strip().split()
#         if len(parts) != 5:
#             continue
#
#         cls = int(parts[0])
#         new_cls = CLASS_MAP.get(cls, cls)
#
#         new_line = " ".join([str(new_cls)] + parts[1:])
#         new_lines.append(new_line)
#
#     with open(file_path, "w") as f:
#         f.write("\n".join(new_lines))
#print("✅ Done merging pimple → acne for YOLO txt labels")
df = pd.read_csv(INPUT_XLSX)
print(df["class"].value_counts())
df["class"] = df["class"].replace({
    "pimple": "acne"
})

df.to_csv(INPUT_XLSX, index=False)
print(df["class"].value_counts())
print("✅ Converted pimple → acne (string label)")


