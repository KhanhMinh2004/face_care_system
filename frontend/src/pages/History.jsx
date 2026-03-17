import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getHistory } from "../api/analyzeApi";
import useAuthCheck from "../hook/useAuthCheck";

// Nhóm records theo ngày
function groupByDate(records) {
  return records.reduce((groups, record) => {
    const date = new Date(record.created_at).toLocaleDateString("vi-VN", {
      weekday: "long",
      year:    "numeric",
      month:   "long",
      day:     "numeric",
    });
    if (!groups[date]) groups[date] = [];
    groups[date].push(record);
    return groups;
  }, {});
}

function RecordCard({ record }) {
  const [expanded, setExpanded] = useState(false);

  const time = new Date(record.created_at).toLocaleTimeString("vi-VN", {
    hour:   "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">

      {/* Header card */}
      <div
        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Ảnh thumbnail */}
        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
          {record.annotated_url ? (
            <img
              src={`http://localhost:8000${record.annotated_url}`}
              alt="annotated"
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">
              🖼️
            </div>
          )}
        </div>

        {/* Thông tin tóm tắt */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              record.skin_label === "good"
                ? "bg-green-100 text-green-700"
                : "bg-orange-100 text-orange-700"
            }`}>
              {record.skin_label === "good" ? "✨ Da đẹp" : "⚠️ Da xấu"}
            </span>
            <span className="text-xs text-gray-400">{time}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1 truncate">{record.summary}</p>

          {/* Tags mụn */}
          {record.detections?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {record.detections.map((d, i) => (
                <span key={i}
                  className="px-2 py-0.5 bg-purple-100 text-purple-600
                             rounded-full text-xs">
                  {d.label}: {d.count}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Expand icon */}
        <span className={`text-gray-400 transition-transform duration-200
          ${expanded ? "rotate-180" : ""}`}>
          ▼
        </span>
      </div>

      {/* Chi tiết mở rộng */}
      {expanded && (
        <div className="border-t border-gray-100 p-4 space-y-4 bg-gray-50">

          {/* Ảnh đầy đủ */}
          <div className="grid grid-cols-2 gap-3">
            {record.image_url && (
              <div>
                <p className="text-xs text-gray-500 mb-1 font-medium">📷 Ảnh gốc</p>
                <img
                  src={`http://localhost:8000${record.image_url}`}
                  alt="original"
                  className="w-full rounded-xl object-cover border border-gray-200"
                />
              </div>
            )}
            {record.annotated_url && (
              <div>
                <p className="text-xs text-gray-500 mb-1 font-medium">🎯 Ảnh nhận diện</p>
                <img
                  src={`http://localhost:8000${record.annotated_url}`}
                  alt="annotated"
                  className="w-full rounded-xl object-cover border border-gray-200"
                />
              </div>
            )}
          </div>

          {/* Câu hỏi */}
          {record.user_question && (
            <div className="bg-white rounded-xl p-3 border border-gray-200">
              <p className="text-xs text-gray-500 font-medium mb-1">❓ Câu hỏi</p>
              <p className="text-sm text-gray-700">{record.user_question}</p>
            </div>
          )}

          {/* Lời khuyên */}
          {record.advice && (
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
              <p className="text-xs text-blue-600 font-medium mb-1">💡 Lời khuyên từ AI</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {record.advice}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function History() {
  useAuthCheck(); // ← giữ phân quyền

  const navigate  = useNavigate();
  const [records, setRecords]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getHistory();
        setRecords(data);
      } catch {
        setError("❌ Không thể tải lịch sử. Vui lòng thử lại!");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const grouped = groupByDate(records);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600
                        rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">📋 Lịch sử chẩn đoán</h1>
              <p className="text-purple-100 mt-1">
                Theo dõi tiến trình chăm sóc da của bạn
              </p>
            </div>
            <button
              onClick={() => navigate("/analyze")}
              className="px-4 py-2 bg-white text-purple-600 font-semibold
                         rounded-xl hover:bg-purple-50 transition text-sm"
            >
              + Phân tích mới
            </button>
          </div>

          {/* Tổng số lần */}
          {records.length > 0 && (
            <div className="mt-4 flex gap-4">
              <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
                <p className="text-2xl font-bold">{records.length}</p>
                <p className="text-xs text-purple-100">Lần chẩn đoán</p>
              </div>
              <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
                <p className="text-2xl font-bold">
                  {records.filter((r) => r.skin_label === "good").length}
                </p>
                <p className="text-xs text-purple-100">Lần da đẹp</p>
              </div>
              <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
                <p className="text-2xl font-bold">
                  {records.filter((r) => r.skin_label === "bad").length}
                </p>
                <p className="text-xs text-purple-100">Lần da xấu</p>
              </div>
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-16 text-purple-400">
            <svg className="animate-spin h-10 w-10 mx-auto mb-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
            </svg>
            <p className="font-medium">Đang tải lịch sử...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4
                          text-red-700 font-medium">
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && records.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-md">
            <span className="text-6xl">🔍</span>
            <p className="text-gray-500 mt-4 text-lg font-medium">
              Chưa có lịch sử chẩn đoán
            </p>
            <button
              onClick={() => navigate("/analyze")}
              className="mt-4 px-6 py-3 bg-gradient-to-r from-pink-500
                         to-purple-600 text-white font-bold rounded-xl"
            >
              Phân tích ngay
            </button>
          </div>
        )}

        {/* Nhóm theo ngày */}
        {!loading && Object.entries(grouped).map(([date, dayRecords]) => (
          <div key={date} className="space-y-3">

            {/* Nhãn ngày */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-purple-200" />
              <span className="text-sm font-semibold text-purple-600
                               bg-purple-50 px-3 py-1 rounded-full border
                               border-purple-200">
                📅 {date}
              </span>
              <div className="h-px flex-1 bg-purple-200" />
            </div>

            {/* Cards trong ngày */}
            {dayRecords.map((record) => (
              <RecordCard key={record.record_id} record={record} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}