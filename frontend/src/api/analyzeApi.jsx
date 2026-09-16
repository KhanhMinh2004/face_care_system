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

// export const analyzeSkin = async ({
//   file,
//   skinContext,
//   userQuestion,
//   onStageChange,
// }) => {
//   const formData = new FormData();
//   formData.append("file", file);
//   formData.append("skin_context", skinContext || "");
//   formData.append("user_question", userQuestion || "Tôi nên chăm sóc da như thế nào?");

//   // Lấy user_id từ token
//   const payload = getTokenPayload();
//   if (payload?.sub) {
//     formData.append("user_id", payload.sub);
//   }

//   // Stage 1: upload
//   onStageChange?.("Đang tải ảnh lên...");

//   // Stage 2: chuyển sau khi request đã bay đi 1 lúc (giả lập classify + yolo đang chạy)
//   const t1 = setTimeout(
//     () => onStageChange?.("Đang nhận diện và phân loại dựa trên ảnh..."),
//     3000
//   );

//   // Stage 3: chuyển khi gần xong (giả lập đang gọi Gemini)
//   // 2.5s là ước lượng — chỉnh theo tốc độ thực của BE
//   const t2 = setTimeout(
//     () => onStageChange?.("Đang tạo lời khuyên từ AI..."),10000
//   );

//   try {
//     const res = await axiosClient.post("/api/analyze", formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     return res.data;
//   } finally {
//     clearTimeout(t1);
//     clearTimeout(t2);
//   }
// };
export const analyzeSkin = async ({
  file,
  skinContext,
  userQuestion,
  onStageChange,
  onChunk,
  onResult,
}) => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("skin_context", skinContext || "");
  formData.append(
    "user_question",
    userQuestion || "Tôi nên chăm sóc da như thế nào?"
  );

  const payload = getTokenPayload();

  if (payload?.sub) {
    formData.append("user_id", payload.sub);
  }

  onStageChange?.("Đang tải ảnh lên...");

  const token = localStorage.getItem("access_token");

  const response = await fetch("http://127.0.0.1:8000/api/analyze", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Analyze failed: ${response.status}`);
  }

  if (!response.body) {
    throw new Error("Browser does not support streaming response.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();

    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const events = buffer.split("\n\n");

    buffer = events.pop();

    for (const event of events) {
      if (!event.trim()) continue;

      let eventType = "message";
      let data = "";

      for (const line of event.split("\n")) {
        if (line.startsWith("event:")) {
          eventType = line.slice(6).trim();
        }

        if (line.startsWith("data:")) {
          data += line.slice(5).trim();
        }
      }

      if (!data) continue;

      try {
        const parsed = JSON.parse(data);

        if (eventType === "stage") {
          onStageChange?.(parsed.stage);
        }

        if (eventType === "token") {
          onChunk?.(parsed.content);
        }

        if (eventType === "result") {
          onResult?.(parsed);
        }

        if (eventType === "error") {
          throw new Error(parsed.message);
        }
      } catch (err) {
        console.error("SSE parse error:", err);
      }
    }
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