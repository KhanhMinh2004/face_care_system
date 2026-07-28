import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getHistory } from "../api/analyzeApi";
import useAuthCheck from "../hook/useAuthCheck";

const SIDEBAR_WIDTH = 220;

const NAV_ITEMS = [
  { path: "/analyze", icon: "🔬", label: "Phân tích da" },
  { path: "/history", icon: "📋", label: "Lịch sử"      },
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

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

      <nav style={{ flex: 1, padding: "16px 12px" }}>
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <div key={item.path} onClick={() => navigate(item.path)}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 14px", borderRadius: 10, marginBottom: 4,
                cursor: "pointer", transition: "all 0.15s",
                background: isActive ? "#f0f9ff" : "transparent",
                color:      isActive ? "#0284c7" : "#64748b",
                fontWeight: isActive ? 600 : 400,
                borderLeft: isActive ? "3px solid #0284c7" : "3px solid transparent",
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

      <div style={{ padding: "16px 12px", borderTop: "1px solid #e2e8f0" }}>
        <div onClick={logout}
          style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "10px 14px", borderRadius: 10,
            cursor: "pointer", color: "#ef4444", transition: "all 0.15s",
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

function groupByDate(records) {
  return records.reduce((groups, record) => {
    const date = new Date(record.created_at).toLocaleDateString("vi-VN", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
    if (!groups[date]) groups[date] = [];
    groups[date].push(record);
    return groups;
  }, {});
}

function RecordCard({ record }) {
  const [expanded, setExpanded] = useState(false);
  const time = new Date(record.created_at).toLocaleTimeString("vi-VN", {
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div style={{
      background: "white", borderRadius: 14,
      border: "1px solid #e2e8f0", overflow: "hidden", marginBottom: 10
    }}>
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "14px 18px", cursor: "pointer", transition: "background 0.15s",
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
        onMouseLeave={(e) => e.currentTarget.style.background = "white"}
      >
        {/* Thumbnail */}
        <div style={{
          width: 56, height: 56, borderRadius: 10, overflow: "hidden",
          background: "#f1f5f9", flexShrink: 0
        }}>
          {record.annotated_url ? (
            <img src={`http://localhost:8000${record.annotated_url}`}
              alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => { e.target.style.display = "none"; }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex",
                          alignItems: "center", justifyContent: "center", fontSize: 22 }}>
              🖼️
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{
              padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700,
              background: record.skin_label === "good" ? "#dcfce7" : "#fff7ed",
              color:      record.skin_label === "good" ? "#16a34a" : "#ea580c",
            }}>
              {record.skin_label === "good" ? "✨ Da đẹp" : "⚠️ Da xấu"}
            </span>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>{time}</span>
          </div>
          <div style={{
            fontSize: 13, color: "#64748b", marginTop: 4,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
          }}>
            {record.summary}
          </div>
          {record.detections?.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
              {record.detections.map((d, i) => (
                <span key={i} style={{
                  padding: "2px 8px", borderRadius: 12,
                  background: "#f5f3ff", color: "#7c3aed", fontSize: 11
                }}>
                  {d.label}: {d.count}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Expand icon */}
        <span style={{
          color: "#94a3b8", fontSize: 12,
          transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.2s"
        }}>▼</span>
      </div>

      {/* Expanded */}
      {expanded && (
        <div style={{
          borderTop: "1px solid #f1f5f9", padding: 18,
          background: "#f8fafc", display: "flex", flexDirection: "column", gap: 14
        }}>
          {/* Ảnh */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {record.image_url && (
              <div>
                <div style={{ fontSize: 12, color: "#64748b",
                              fontWeight: 500, marginBottom: 6 }}>
                  📷 Ảnh gốc
                </div>
                <img src={`http://localhost:8000${record.image_url}`}
                  alt="original" style={{ width: "100%", borderRadius: 10,
                  border: "1px solid #e2e8f0", objectFit: "cover" }} />
              </div>
            )}
            {record.annotated_url && (
              <div>
                <div style={{ fontSize: 12, color: "#64748b",
                              fontWeight: 500, marginBottom: 6 }}>
                  🎯 Ảnh nhận diện
                </div>
                <img src={`http://localhost:8000${record.annotated_url}`}
                  alt="annotated" style={{ width: "100%", borderRadius: 10,
                  border: "1px solid #e2e8f0", objectFit: "cover" }} />
              </div>
            )}
          </div>

          {/* Câu hỏi */}
          {record.user_question && (
            <div style={{
              background: "white", borderRadius: 10, padding: 14,
              border: "1px solid #e2e8f0"
            }}>
              <div style={{ fontSize: 12, color: "#94a3b8",
                            fontWeight: 500, marginBottom: 4 }}>
                ❓ Câu hỏi
              </div>
              <div style={{ fontSize: 13, color: "#374151" }}>
                {record.user_question}
              </div>
            </div>
          )}

          {/* Lời khuyên */}
          {record.advice && (
            <div style={{
              background: "#eff6ff", borderRadius: 10, padding: 14,
              border: "1px solid #bfdbfe"
            }}>
              <div style={{ fontSize: 12, color: "#2563eb",
                            fontWeight: 500, marginBottom: 4 }}>
                💡 Lời khuyên từ AI
              </div>
              <div style={{
                fontSize: 13, color: "#374151",
                whiteSpace: "pre-wrap", lineHeight: 1.7
              }}>
                {record.advice}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function History() {
  useAuthCheck();
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getHistory();
        setRecords(data);
      } catch {
        setError("❌ Không thể tải lịch sử.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const grouped = groupByDate(records);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <Sidebar />

      <div style={{ marginLeft: SIDEBAR_WIDTH, flex: 1 }}>

        {/* Topbar */}
        <div style={{
          background: "white", borderBottom: "1px solid #e2e8f0",
          padding: "16px 32px", position: "sticky", top: 0, zIndex: 9,
          display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 20, color: "#0f172a" }}>
              Lịch sử chẩn đoán
            </div>
            <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 2 }}>
              Theo dõi tiến trình chăm sóc da của bạn
            </div>
          </div>
          <button
            onClick={() => navigate("/analyze")}
            style={{
              padding: "8px 18px", background: "#0284c7", color: "white",
              border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600,
              cursor: "pointer"
            }}
          >
            + Phân tích mới
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 32 }}>

          {/* Stat cards */}
          {records.length > 0 && (
            <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
              {[
                { label: "Tổng chẩn đoán", value: records.length, color: "#0284c7", bg: "#f0f9ff", border: "#bae6fd" },
                { label: "Lần da đẹp", value: records.filter(r => r.skin_label === "good").length, color: "#16a34a", bg: "#f0fdf4", border: "#86efac" },
                { label: "Lần da xấu", value: records.filter(r => r.skin_label === "bad").length,  color: "#ea580c", bg: "#fff7ed", border: "#fdba74" },
              ].map((s) => (
                <div key={s.label} style={{
                  background: s.bg, borderRadius: 12, padding: "16px 24px",
                  border: `1px solid ${s.border}`, textAlign: "center", minWidth: 120
                }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
              <div style={{ fontSize: 15, fontWeight: 500 }}>Đang tải lịch sử...</div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              background: "#fef2f2", border: "1px solid #fecaca",
              borderRadius: 12, padding: "14px 18px",
              color: "#dc2626", fontSize: 14
            }}>
              {error}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && records.length === 0 && (
            <div style={{
              background: "white", borderRadius: 16, border: "1px solid #e2e8f0",
              textAlign: "center", padding: 60
            }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#64748b" }}>
                Chưa có lịch sử chẩn đoán
              </div>
              <button
                onClick={() => navigate("/analyze")}
                style={{
                  marginTop: 16, padding: "10px 24px",
                  background: "#0284c7", color: "white",
                  border: "none", borderRadius: 8,
                  fontSize: 14, fontWeight: 600, cursor: "pointer"
                }}
              >
                Phân tích ngay
              </button>
            </div>
          )}

          {/* Grouped records */}
          {!loading && Object.entries(grouped).map(([date, dayRecords]) => (
            <div key={date} style={{ marginBottom: 24 }}>
              {/* Date divider */}
              <div style={{
                display: "flex", alignItems: "center", gap: 12, marginBottom: 12
              }}>
                <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
                <span style={{
                  fontSize: 12, fontWeight: 600, color: "#64748b",
                  background: "#f1f5f9", padding: "4px 14px",
                  borderRadius: 20, border: "1px solid #e2e8f0"
                }}>
                  📅 {date}
                </span>
                <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
              </div>

              {dayRecords.map((record) => (
                <RecordCard key={record.record_id} record={record} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}