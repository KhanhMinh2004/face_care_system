import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";  
import { analyzeSkin } from "../api/analyzeApi";
import useAuthCheck from "../hook/useAuthCheck";

const STAGES = [
  "Đang tải ảnh lên...",
  "Đang phân loại tình trạng da...",
  "Đang nhận diện mụn...",
  "Đang tạo lời khuyên từ AI...",
];

const STAGE_ICONS = {
  "Đang tải ảnh lên...":              "📤",
  "Đang phân loại tình trạng da...":  "🔍",
  "Đang nhận diện mụn...":            "🎯",
  "Đang tạo lời khuyên từ AI...":     "🤖",
};

export default function SkinAnalyze() {
  useAuthCheck(); // ← giữ đúng phân quyền
  const navigate = useNavigate();
  const [file,         setFile]         = useState(null);
  const [preview,      setPreview]      = useState(null);
  const [skinContext,  setSkinContext]  = useState("");
  const [userQuestion, setUserQuestion] = useState("");
  const [stage,        setStage]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [result,       setResult]       = useState(null);
  const [error,        setError]        = useState("");
  const fileRef = useRef();

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError("");
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await analyzeSkin({
        file,
        skinContext,
        userQuestion,
        onStageChange: setStage,
      });
      setResult(data);
    } catch (err) {
      setError("❌ Lỗi phân tích. Vui lòng thử lại!");
    } finally {
      setLoading(false);
      setStage("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
          <h1 className="text-3xl font-bold">🔬 Phân tích tình trạng da</h1>
          <p className="text-pink-100 mt-1">
            Tải ảnh lên để nhận chẩn đoán và lời khuyên từ AI
          </p>
        </div>

        <div className="flex flex-col gap-2">
              <button
                onClick={() => navigate("/history")}
                className="px-4 py-2 bg-white text-purple-600 font-semibold
                           rounded-xl hover:bg-purple-50 transition text-sm"
              >
                📋 Lịch sử
              </button>
        </div>

        {/* Upload + Input */}
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">

          {/* Upload ảnh */}
          <div
            onClick={() => fileRef.current.click()}
            className="border-2 border-dashed border-purple-300 rounded-xl p-8
                       text-center cursor-pointer hover:border-purple-500
                       hover:bg-purple-50 transition"
          >
            {preview ? (
              <img
                src={preview}
                alt="preview"
                className="max-h-64 mx-auto rounded-lg object-contain"
              />
            ) : (
              <div className="text-gray-400 space-y-2">
                <div className="text-5xl">📷</div>
                <p className="font-medium">Nhấn để chọn ảnh khuôn mặt</p>
                <p className="text-sm">JPG, PNG — tối đa 10MB</p>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />
          </div>

          {/* Loại da */}
          <select
            value={skinContext}
            onChange={(e) => setSkinContext(e.target.value)}
            className="w-full border border-gray-200 rounded-xl p-3 text-gray-700
                       focus:border-purple-400 outline-none"
          >
            <option value="">Loại da (tùy chọn)</option>
            <option value="da dầu">Da dầu</option>
            <option value="da khô">Da khô</option>
            <option value="da hỗn hợp">Da hỗn hợp</option>
            <option value="da nhạy cảm">Da nhạy cảm</option>
          </select>

          {/* Câu hỏi */}
          <textarea
            rows={2}
            value={userQuestion}
            onChange={(e) => setUserQuestion(e.target.value)}
            placeholder="Câu hỏi của bạn... (ví dụ: Tôi nên dùng sản phẩm gì?)"
            className="w-full border border-gray-200 rounded-xl p-3 text-gray-700
                       focus:border-purple-400 outline-none resize-none"
          />

          {/* Nút phân tích */}
          <button
            onClick={handleAnalyze}
            disabled={!file || loading}
            className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600
                       text-white font-bold rounded-xl shadow-md hover:shadow-lg
                       transition disabled:opacity-50 text-lg"
          >
            {loading ? "Đang phân tích..." : "🚀 Phân tích ngay"}
          </button>
        </div>

        {/* Loading stages */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <p className="text-center font-semibold text-purple-600 text-lg mb-4">
              Quy trình phân tích
            </p>
            <div className="space-y-3">
              {STAGES.map((s) => {
                const currentIdx = STAGES.indexOf(stage);
                const thisIdx    = STAGES.indexOf(s);
                const isDone     = thisIdx < currentIdx;
                const isCurrent  = s === stage;

                return (
                  <div
                    key={s}
                    className={`flex items-center gap-3 p-3 rounded-xl transition
                      ${isCurrent ? "bg-purple-100 border border-purple-300" : ""}
                      ${isDone    ? "opacity-40" : ""}`}
                  >
                    <span className="text-2xl">{STAGE_ICONS[s]}</span>
                    <span className={`font-medium ${isCurrent ? "text-purple-700" : "text-gray-500"}`}>
                      {s}
                    </span>
                    {isCurrent && (
                      <svg className="ml-auto animate-spin h-5 w-5 text-purple-500" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10"
                          stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
                      </svg>
                    )}
                    {isDone && <span className="ml-auto text-green-500 font-bold">✓</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 font-medium">
            {error}
          </div>
        )}

        {/* Kết quả */}
        {result && (
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-5">
            <h2 className="text-2xl font-bold text-gray-800">📊 Kết quả phân tích</h2>

            {/* Tình trạng da */}
            <div className={`p-4 rounded-xl border-2 ${
              result.skin_label === "good"
                ? "bg-green-50 border-green-300"
                : "bg-orange-50 border-orange-300"
            }`}>
              <p className="font-bold text-xl">
                {result.skin_label === "good" ? "✨ Da đẹp" : "⚠️ Da xấu"}
              </p>
              <p className="text-gray-600 mt-1">{result.summary}</p>
            </div>

            {/* Detections */}
            {result.detections?.length > 0 && (
              <div>
                <p className="font-semibold text-gray-700 mb-2">📋 Phát hiện</p>
                <div className="flex flex-wrap gap-2">
                  {result.detections.map((d, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-purple-100 text-purple-700
                                 rounded-full text-sm font-medium"
                    >
                      {d.label}: {d.count} vị trí
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Ảnh bbox */}
            {result.annotated_b64 && (
              <div>
                <p className="font-semibold text-gray-700 mb-2">🎯 Ảnh nhận diện</p>
                <img
                  src={`data:image/jpeg;base64,${result.annotated_b64}`}
                  alt="annotated"
                  className="w-full rounded-xl border border-gray-200"
                />
              </div>
            )}

            {/* Lời khuyên */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
              <p className="font-semibold text-blue-800 mb-3">💡 Lời khuyên chăm sóc da</p>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {result.advice}
              </p>
            </div>

            {/* Link xem ảnh đã lưu */}
            <div className="text-sm text-gray-400 space-y-1">
              <p>🔗 Ảnh gốc: <a href={`http://localhost:8000${result.image_url}`}
                className="text-blue-500 underline" target="_blank" rel="noreferrer">
                xem ảnh</a>
              </p>
              <p>🔗 Ảnh bbox: <a href={`http://localhost:8000${result.annotated_url}`}
                className="text-blue-500 underline" target="_blank" rel="noreferrer">
                xem ảnh</a>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}