import axiosClient from "./axiosClient";

const getTokenPayload = () => {
  const token = localStorage.getItem("access_token");
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

export const analyzeSkin = async ({
  file,
  skinContext,
  userQuestion,
  onStageChange,
}) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("skin_context", skinContext || "");
  formData.append("user_question", userQuestion || "Tôi nên chăm sóc da như thế nào?");

  // Lấy user_id từ token
  const payload = getTokenPayload();
  if (payload?.sub) {
    formData.append("user_id", payload.sub);
  }

  // Stage 1: upload
  onStageChange?.("Đang tải ảnh lên...");

  // Stage 2: chuyển sau khi request đã bay đi 1 lúc (giả lập classify + yolo đang chạy)
  const t1 = setTimeout(
    () => onStageChange?.("Đang nhận diện và phân loại dựa trên ảnh..."),
    3000
  );

  // Stage 3: chuyển khi gần xong (giả lập đang gọi Gemini)
  // 2.5s là ước lượng — chỉnh theo tốc độ thực của BE
  const t2 = setTimeout(
    () => onStageChange?.("Đang tạo lời khuyên từ AI..."),10000
  );

  try {
    const res = await axiosClient.post("/api/analyze", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } finally {
    clearTimeout(t1);
    clearTimeout(t2);
  }
};


export const getHistory = async () => {
  // Lấy user_id từ token
  const payload = getTokenPayload();
  if (!payload) return [];

  const userId = payload.sub;
  if (!userId) return [];

  const res = await axiosClient.get(`/api/analyze/history/${userId}`);
  return res.data;
};