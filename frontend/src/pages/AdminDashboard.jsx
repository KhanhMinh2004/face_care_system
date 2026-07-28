import { useEffect, useState } from "react";
import { getUsers, deleteUser, updateRole } from "../api/adminApi";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Button, Chip,
  Dialog, DialogTitle, DialogActions, TextField
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const drawerWidth = 220;

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [users,      setUsers]      = useState([]);
  const [deleteId,   setDeleteId]   = useState(null);
  const [roleUserId, setRoleUserId] = useState(null);
  const [role,       setRole]       = useState("");
  const [activeNav,  setActiveNav]  = useState("users");

  const loadUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch {
      alert("Unauthorized");
      logout();
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const confirmDelete = async () => {
    await deleteUser(deleteId);
    setDeleteId(null);
    loadUsers();
  };

  const confirmChangeRole = async () => {
    await updateRole(roleUserId, role);
    setRoleUserId(null);
    setRole("");
    loadUsers();
  };

  const columns = [
    { field: "id",    headerName: "ID",    width: 70 },
    { field: "email", headerName: "Email", width: 260 },
    {
      field: "role", headerName: "Role", width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            fontWeight: 600,
            bgcolor: params.value === "admin" ? "#fee2e2" : "#dbeafe",
            color:   params.value === "admin" ? "#dc2626" : "#2563eb",
            border:  "none"
          }}
        />
      )
    },
    {
      field: "is_verified", headerName: "Verified", width: 110,
      renderCell: (params) => (
        <Chip
          label={params.value ? "Yes" : "No"}
          size="small"
          sx={{
            fontWeight: 600,
            bgcolor: params.value ? "#dcfce7" : "#f1f5f9",
            color:   params.value ? "#16a34a" : "#94a3b8",
            border:  "none"
          }}
        />
      )
    },
    {
      field: "actions", headerName: "Actions", width: 200,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            size="small" variant="outlined"
            onClick={() => setRoleUserId(params.row.id)}
            sx={{
              borderRadius: 2, fontSize: 12, textTransform: "none",
              borderColor: "#0284c7", color: "#0284c7",
              "&:hover": { bgcolor: "#f0f9ff", borderColor: "#0284c7" }
            }}
          >
            Đổi role
          </Button>
          <Button
            size="small" variant="contained"
            onClick={() => setDeleteId(params.row.id)}
            sx={{
              borderRadius: 2, fontSize: 12, textTransform: "none",
              bgcolor: "#ef4444",
              "&:hover": { bgcolor: "#dc2626" }
            }}
          >
            Xóa
          </Button>
        </Box>
      )
    }
  ];

  const NAV_ITEMS = [
    { key: "users",     icon: "👥", label: "Quản lý User"    },
    // { key: "diagnosis", icon: "🔬", label: "Chẩn đoán da",
    //   onClick: () => navigate("/admin/diagnosis") },
  ];

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f8fafc" }}>

      {/* ── Sidebar ── */}
      <Box sx={{
        width: drawerWidth, bgcolor: "white", flexShrink: 0,
        borderRight: "1px solid #e2e8f0", position: "fixed",
        height: "100vh", display: "flex", flexDirection: "column", zIndex: 10
      }}>

        {/* Logo */}
        <Box sx={{
          p: "24px 20px", borderBottom: "1px solid #e2e8f0",
          display: "flex", alignItems: "center", gap: 1.5
        }}>
          <Typography fontSize={28}>🏥</Typography>
          <Box>
            <Typography fontWeight={700} fontSize={15} color="#0f172a">
              Skin Care AI
            </Typography>
            <Typography fontSize={11} color="#94a3b8">
              Admin Panel
            </Typography>
          </Box>
        </Box>

        {/* Nav */}
        <Box sx={{ flex: 1, p: "16px 12px" }}>
          {NAV_ITEMS.map((item) => {
            const isActive = activeNav === item.key;
            return (
              <Box
                key={item.key}
                onClick={() => {
                  if (item.onClick) item.onClick();
                  else setActiveNav(item.key);
                }}
                sx={{
                  display: "flex", alignItems: "center", gap: 1.5,
                  p: "10px 14px", borderRadius: 2.5, mb: 0.5,
                  cursor: "pointer", transition: "all 0.15s",
                  bgcolor:    isActive ? "#f0f9ff" : "transparent",
                  color:      isActive ? "#0284c7" : "#64748b",
                  fontWeight: isActive ? 600 : 400,
                  borderLeft: isActive
                    ? "3px solid #0284c7"
                    : "3px solid transparent",
                  "&:hover": {
                    bgcolor: isActive ? "#f0f9ff" : "#f8fafc",
                    color:   "#0284c7"
                  }
                }}
              >
                <Typography fontSize={18}>{item.icon}</Typography>
                <Typography fontSize={14}>{item.label}</Typography>
              </Box>
            );
          })}
        </Box>

        {/* Logout */}
        <Box sx={{ p: "16px 12px", borderTop: "1px solid #e2e8f0" }}>
          <Box
            onClick={logout}
            sx={{
              display: "flex", alignItems: "center", gap: 1.5,
              p: "10px 14px", borderRadius: 2.5, cursor: "pointer",
              color: "#ef4444", transition: "all 0.15s",
              "&:hover": { bgcolor: "#fef2f2" }
            }}
          >
            <Typography fontSize={18}>🚪</Typography>
            <Typography fontSize={14} fontWeight={500}>Đăng xuất</Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Main ── */}
      <Box sx={{ ml: `${drawerWidth}px`, flex: 1, display: "flex", flexDirection: "column" }}>

        {/* Topbar */}
        <Box sx={{
          bgcolor: "white", borderBottom: "1px solid #e2e8f0",
          px: 4, py: 2, display: "flex",
          alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 9
        }}>
          <Box>
            <Typography fontWeight={700} fontSize={20} color="#0f172a">
              Admin Dashboard
            </Typography>
            <Typography fontSize={13} color="#94a3b8">
              Quản lý hệ thống Skin Care AI
            </Typography>
          </Box>

          {/* Stat chips */}
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Box sx={{
              px: 2.5, py: 1, bgcolor: "#f0f9ff", borderRadius: 3,
              border: "1px solid #bae6fd", textAlign: "center"
            }}>
              <Typography fontSize={18} fontWeight={700} color="#0284c7">
                {users.length}
              </Typography>
              <Typography fontSize={11} color="#64748b">Tổng user</Typography>
            </Box>
            <Box sx={{
              px: 2.5, py: 1, bgcolor: "#fef2f2", borderRadius: 3,
              border: "1px solid #fecaca", textAlign: "center"
            }}>
              <Typography fontSize={18} fontWeight={700} color="#dc2626">
                {users.filter(u => u.role === "admin").length}
              </Typography>
              <Typography fontSize={11} color="#64748b">Admin</Typography>
            </Box>
            <Box sx={{
              px: 2.5, py: 1, bgcolor: "#f0fdf4", borderRadius: 3,
              border: "1px solid #bbf7d0", textAlign: "center"
            }}>
              <Typography fontSize={18} fontWeight={700} color="#16a34a">
                {users.filter(u => u.is_verified).length}
              </Typography>
              <Typography fontSize={11} color="#64748b">Verified</Typography>
            </Box>
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ p: 4 }}>

          {/* Table header */}
          <Box sx={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between", mb: 3
          }}>
            <Box>
              <Typography fontWeight={700} fontSize={18} color="#0f172a">
                👥 Quản lý người dùng
              </Typography>
              <Typography fontSize={13} color="#94a3b8" mt={0.3}>
                {users.length} người dùng trong hệ thống
              </Typography>
            </Box>
          </Box>

          {/* DataGrid */}
          <Box sx={{
            bgcolor: "white", borderRadius: 3,
            border: "1px solid #e2e8f0", overflow: "hidden"
          }}>
            <DataGrid
              rows={users}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10]}
              autoHeight
              disableSelectionOnClick
              sx={{
                border: "none",
                "& .MuiDataGrid-columnHeaders": {
                  bgcolor: "#f8fafc",
                  borderBottom: "1px solid #e2e8f0",
                  fontWeight: 600, fontSize: 13, color: "#64748b"
                },
                "& .MuiDataGrid-row": {
                  "&:hover": { bgcolor: "#f8fafc" }
                },
                "& .MuiDataGrid-cell": {
                  borderColor: "#f1f5f9", fontSize: 14
                },
                "& .MuiDataGrid-footerContainer": {
                  borderTop: "1px solid #e2e8f0", bgcolor: "#f8fafc"
                }
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* ── Delete Dialog ── */}
      <Dialog open={!!deleteId} PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: "#0f172a" }}>
          ⚠️ Xóa người dùng này?
        </DialogTitle>
        <Typography sx={{ px: 3, pb: 1, color: "#64748b", fontSize: 14 }}>
          Hành động này không thể hoàn tác.
        </Typography>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteId(null)}
            sx={{ borderRadius: 2, textTransform: "none", color: "#64748b" }}>
            Hủy
          </Button>
          <Button onClick={confirmDelete} variant="contained"
            sx={{
              borderRadius: 2, textTransform: "none",
              bgcolor: "#ef4444", "&:hover": { bgcolor: "#dc2626" }
            }}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Change Role Dialog ── */}
      <Dialog open={!!roleUserId} PaperProps={{ sx: { borderRadius: 3, p: 1, minWidth: 320 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: "#0f172a" }}>
          🔄 Đổi Role
        </DialogTitle>
        <Box sx={{ px: 3, pb: 2 }}>
          <TextField
            label="Role (admin / user)"
            fullWidth
            value={role}
            onChange={(e) => setRole(e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
        </Box>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRoleUserId(null)}
            sx={{ borderRadius: 2, textTransform: "none", color: "#64748b" }}>
            Hủy
          </Button>
          <Button onClick={confirmChangeRole} variant="contained"
            sx={{
              borderRadius: 2, textTransform: "none",
              bgcolor: "#0284c7", "&:hover": { bgcolor: "#0369a1" }
            }}>
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}