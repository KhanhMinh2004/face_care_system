import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { analyzeSkin } from "../api/analyzeApi";
import useAuthCheck from "../hook/useAuthCheck";
import ReactMarkdown from "react-markdown";

const SIDEBAR_WIDTH = 220;

const NAV_ITEMS = [
  { path: "/analyze", icon: "🔬", label: "Phân tích da" },
  { path: "/history", icon: "📋", label: "Lịch sử"      },
];

const STAGES = [
  "Đang tải ảnh lên...",
  "Đang nhận diện và phân loại dựa trên ảnh...",
  "Đang tạo lời khuyên từ AI...",
];

const STAGE_ICONS = {
  "Đang tải ảnh lên...":             "📤",
  "Đang nhận diện và phân loại dựa trên ảnh...": "🔍",
  "Đang tạo lời khuyên từ AI...":    "🤖",
};

function Sidebar() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div style={{
      width: SIDEBAR_WIDTH, background: "white",
      borderRight: "1px solid #e2e8f0", position: "fixed",
      height: "100vh", display: "flex", flexDirection: "column", zIndex: 10
    }}>
      {/* Logo */}
      <div style={{ padding: "24px 20px", borderBottom: "1px solid #e2e8f0",
                    display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 28 }}>🏥</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>
            Skin Care AI
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>
            Chăm sóc da thông minh
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px" }}>
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 14px", borderRadius: 10, marginBottom: 4,
                cursor: "pointer", transition: "all 0.15s",
                background:  isActive ? "#f0f9ff" : "transparent",
                color:       isActive ? "#0284c7" : "#64748b",
                fontWeight:  isActive ? 600 : 400,
                borderLeft:  isActive ? "3px solid #0284c7" : "3px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = "#f8fafc";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = "transparent";
              }}
            >
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span style={{ fontSize: 14 }}>{item.label}</span>
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: "16px 12px", borderTop: "1px solid #e2e8f0" }}>
        <div
          onClick={logout}
          style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "10px 14px", borderRadius: 10, cursor: "pointer",
            color: "#ef4444", transition: "all 0.15s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "#fef2f2"}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
        >
          <span style={{ fontSize: 18 }}>🚪</span>
          <span style={{ fontSize: 14, fontWeight: 500 }}>Đăng xuất</span>
        </div>
      </div>
    </div>
  );
}

export default function SkinAnalyze() {
  useAuthCheck();

  const [file,         setFile]        = useState(null);
  const [preview,      setPreview]     = useState(null);
  const [skinContext,  setSkinContext] = useState("");
  const [userQuestion, setUserQuestion]= useState("");
  const [stage,        setStage]       = useState("");
  const [loading,      setLoading]     = useState(false);
  const [result,       setResult]      = useState(null);
  const [error,        setError]       = useState("");
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
        file, skinContext, userQuestion,
        onStageChange: setStage,
      });
      setResult(data);
    } catch {
      setError("❌ Lỗi phân tích. Vui lòng thử lại!");
    } finally {
      setLoading(false);
      setStage("");
    }
  };

  const card = {
    background: "white", borderRadius: 16,
    border: "1px solid #e2e8f0", overflow: "hidden",
    marginBottom: 20,
  };

  const cardHeader = {
    padding: "14px 20px", borderBottom: "1px solid #f1f5f9",
    fontWeight: 600, fontSize: 15, color: "#0f172a",
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <Sidebar />

      <div style={{ marginLeft: SIDEBAR_WIDTH, flex: 1 }}>

        {/* Topbar */}
        <div style={{
          background: "white", borderBottom: "1px solid #e2e8f0",
          padding: "16px 32px", position: "sticky", top: 0, zIndex: 9
        }}>
          <div style={{ fontWeight: 700, fontSize: 20, color: "#0f172a" }}>
            Phân tích tình trạng da
          </div>
          <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 2 }}>
            Tải ảnh lên để nhận chẩn đoán và lời khuyên từ AI
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: 32 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

            {/* ── Cột trái ── */}
            <div>
              {/* Upload */}
              <div style={card}>
                <div style={cardHeader}>📷 Ảnh khuôn mặt</div>
                <div style={{ padding: 20 }}>
                  <div
                    onClick={() => fileRef.current.click()}
                    style={{
                      border: "2px dashed #cbd5e1", borderRadius: 12,
                      padding: 32, textAlign: "center", cursor: "pointer",
                      background: "#f8fafc", transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#0284c7";
                      e.currentTarget.style.background  = "#f0f9ff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#cbd5e1";
                      e.currentTarget.style.background  = "#f8fafc";
                    }}
                  >
                    {preview ? (
                      <img src={preview} alt="preview" style={{
                        maxHeight: 200, maxWidth: "100%",
                        borderRadius: 8, objectFit: "contain"
                      }} />
                    ) : (
                      <>
                        <div style={{ fontSize: 40, marginBottom: 8 }}>📷</div>
                        <div style={{ color: "#64748b", fontSize: 14, fontWeight: 500 }}>
                          Nhấn để chọn ảnh
                        </div>
                        <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 4 }}>
                          JPG, PNG — tối đa 10MB
                        </div>
                      </>
                    )}
                    <input ref={fileRef} type="file" accept="image/*"
                      style={{ display: "none" }} onChange={handleFile} />
                  </div>
                </div>
              </div>

              {/* Options */}
              <div style={card}>
                <div style={cardHeader}>⚙️ Tùy chọn</div>
                <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <div style={{ fontSize: 13, color: "#64748b",
                                  fontWeight: 500, marginBottom: 6 }}>
                      Loại da
                    </div>
                    <select
                      value={skinContext}
                      onChange={(e) => setSkinContext(e.target.value)}
                      style={{
                        width: "100%", padding: "10px 12px", borderRadius: 8,
                        border: "1px solid #e2e8f0", fontSize: 14,
                        color: "#0f172a", background: "white",
                        outline: "none", boxSizing: "border-box"
                      }}
                    >
                      <option value="">Chọn loại da (tùy chọn)</option>
                      <option value="da dầu">Da dầu</option>
                      <option value="da khô">Da khô</option>
                      <option value="da hỗn hợp">Da hỗn hợp</option>
                      <option value="da nhạy cảm">Da nhạy cảm</option>
                    </select>
                  </div>

                  <div>
                    <div style={{ fontSize: 13, color: "#64748b",
                                  fontWeight: 500, marginBottom: 6 }}>
                      Câu hỏi của bạn
                    </div>
                    <textarea
                      rows={3}
                      value={userQuestion}
                      onChange={(e) => setUserQuestion(e.target.value)}
                      placeholder="Ví dụ: Tôi nên dùng sản phẩm gì?"
                      style={{
                        width: "100%", padding: "10px 12px", borderRadius: 8,
                        border: "1px solid #e2e8f0", fontSize: 14,
                        color: "#0f172a", resize: "none", outline: "none",
                        fontFamily: "inherit", boxSizing: "border-box"
                      }}
                    />
                  </div>

                  <button
                    onClick={handleAnalyze}
                    disabled={!file || loading}
                    style={{
                      width: "100%", padding: "12px 0",
                      background: (!file || loading)
                        ? "#e2e8f0"
                        : "linear-gradient(135deg, #0284c7, #0ea5e9)",
                      color: (!file || loading) ? "#94a3b8" : "white",
                      border: "none", borderRadius: 10, fontSize: 15,
                      fontWeight: 700, cursor: (!file || loading) ? "not-allowed" : "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {loading ? "⏳ Đang phân tích..." : "🚀 Phân tích ngay"}
                  </button>
                </div>
              </div>

              {/* Loading stages */}
              {loading && (
                <div style={card}>
                  <div style={cardHeader}>⏳ Quy trình phân tích</div>
                  <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                    {STAGES.map((s) => {
                      const currentIdx = STAGES.indexOf(stage);
                      const thisIdx    = STAGES.indexOf(s);
                      const isDone     = thisIdx < currentIdx;
                      const isCurrent  = s === stage;
                      return (
                        <div key={s} style={{
                          display: "flex", alignItems: "center", gap: 12,
                          padding: "10px 14px", borderRadius: 10,
                          background:  isCurrent ? "#f0f9ff" : "transparent",
                          border:      isCurrent ? "1px solid #bae6fd" : "1px solid transparent",
                          opacity:     isDone ? 0.4 : 1,
                          transition:  "all 0.15s",
                        }}>
                          <span style={{ fontSize: 20 }}>{STAGE_ICONS[s]}</span>
                          <span style={{
                            fontSize: 14, fontWeight: isCurrent ? 600 : 400,
                            color: isCurrent ? "#0284c7" : "#64748b", flex: 1
                          }}>
                            {s}
                          </span>
                          {isCurrent && (
                            <svg style={{ width: 18, height: 18, color: "#0284c7" }}
                              className="animate-spin" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10"
                                stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
                            </svg>
                          )}
                          {isDone && (
                            <span style={{ color: "#16a34a", fontWeight: 700 }}>✓</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div style={{
                  background: "#fef2f2", border: "1px solid #fecaca",
                  borderRadius: 12, padding: "14px 18px",
                  color: "#dc2626", fontSize: 14, fontWeight: 500
                }}>
                  {error}
                </div>
              )}
            </div>

            {/* ── Cột phải: Kết quả ── */}
            <div>
              {!result && !loading && (
                <div style={{
                  ...card, textAlign: "center",
                  padding: 60, color: "#94a3b8"
                }}>
                  <div style={{ fontSize: 56, marginBottom: 16 }}>🔬</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "#64748b" }}>
                    Kết quả sẽ hiển thị ở đây
                  </div>
                  <div style={{ fontSize: 13, marginTop: 6 }}>
                    Chọn ảnh và nhấn phân tích để bắt đầu
                  </div>
                </div>
              )}

              {result && (
                <>
                  {/* Tình trạng da */}
                  <div style={card}>
                    <div style={cardHeader}>📊 Kết quả phân tích</div>
                    <div style={{ padding: 20 }}>
                      <div style={{
                        padding: "14px 18px", borderRadius: 12, marginBottom: 14,
                        background: result.skin_label === "good" ? "#f0fdf4" : "#fff7ed",
                        border: `1px solid ${result.skin_label === "good" ? "#86efac" : "#fdba74"}`,
                      }}>
                        <div style={{
                          fontSize: 18, fontWeight: 700,
                          color: result.skin_label === "good" ? "#16a34a" : "#ea580c"
                        }}>
                          {result.skin_label === "good" ? "✨ Da đẹp" : "⚠️ Da xấu"}
                        </div>
                        <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
                          {result.summary}
                        </div>
                      </div>

                      {/* Detections */}
                      {result.detections?.length > 0 && (
                        <div style={{ marginBottom: 14 }}>
                          <div style={{ fontSize: 13, fontWeight: 600,
                                        color: "#64748b", marginBottom: 8 }}>
                            📋 Phát hiện mụn
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {result.detections.map((d, i) => (
                              <span key={i} style={{
                                padding: "4px 12px", borderRadius: 20,
                                background: "#f5f3ff", color: "#7c3aed",
                                fontSize: 12, fontWeight: 600
                              }}>
                                {d.label}: {d.count} vị trí
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Link ảnh */}
                      <div style={{ display: "flex", gap: 8 }}>
                        <a href={`http://localhost:8000${result.image_url}`}
                          target="_blank" rel="noreferrer"
                          style={{
                            fontSize: 12, color: "#0284c7",
                            textDecoration: "none", padding: "4px 10px",
                            background: "#f0f9ff", borderRadius: 6
                          }}>
                          🔗 Ảnh gốc
                        </a>
                        <a href={`http://localhost:8000${result.annotated_url}`}
                          target="_blank" rel="noreferrer"
                          style={{
                            fontSize: 12, color: "#0284c7",
                            textDecoration: "none", padding: "4px 10px",
                            background: "#f0f9ff", borderRadius: 6
                          }}>
                          🔗 Ảnh bbox
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Ảnh bbox */}
                  {result.annotated_b64 && (
                    <div style={card}>
                      <div style={cardHeader}>🎯 Ảnh nhận diện mụn</div>
                      <div style={{ padding: 16 }}>
                        <img
                          src={`data:image/jpeg;base64,${result.annotated_b64}`}
                          alt="annotated"
                          style={{ width: "100%", borderRadius: 10, objectFit: "contain" }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Lời khuyên */}
                  {result.advice && (
                    <div style={card}>
                      <div style={cardHeader}>💡 Lời khuyên từ AI</div>
                      <div style={{ padding: 20 }}>
                        <div className="markdown-body" style={{
                          fontSize: 14, color: "#374151", lineHeight: 1.7
                        }}>
                          <ReactMarkdown>{result.advice}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`
      .markdown-body p {
        margin: 0 0 10px 0;
      }

      .markdown-body ul,
      .markdown-body ol {
        padding-left: 22px;
        margin: 8px 0;
      }

      .markdown-body ul { list-style: disc; }
      .markdown-body ol { list-style: decimal; }

      .markdown-body li {
        margin: 4px 0;
      }

      .markdown-body li > p {
        margin: 0;
      }

      .markdown-body h1,
      .markdown-body h2,
      .markdown-body h3 {
        margin: 16px 0 8px 0;
        font-weight: 700;
        color: #0f172a;
      }

      .markdown-body h3 { font-size: 15px; }
      .markdown-body h2 { font-size: 16px; }
      .markdown-body h1 { font-size: 18px; }

      .markdown-body strong {
        font-weight: 700;
        color: #0f172a;
      }
    `}</style>
    </div>
  );
}

