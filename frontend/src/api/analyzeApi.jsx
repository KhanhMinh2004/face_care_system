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

  onStageChange?.("Đang tải ảnh lên...");
  await new Promise((r) => setTimeout(r, 400));

  onStageChange?.("Đang phân loại tình trạng da...");
  await new Promise((r) => setTimeout(r, 600));

  onStageChange?.("Đang nhận diện mụn...");

  const res = await axiosClient.post("/api/analyze", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  onStageChange?.("Đang tạo lời khuyên từ AI...");
  return res.data;
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