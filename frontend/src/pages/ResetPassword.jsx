import { useState } from "react";
import { resetPassword } from "../api/authApi";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  Container, Card, CardContent, TextField,
  Button, Typography, Box, CircularProgress
} from "@mui/material";

export default function ResetPassword() {
  const [params]  = useSearchParams();
  const email     = params.get("email");
  const navigate  = useNavigate();

  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading,         setLoading]         = useState(false);
  const [success,         setSuccess]         = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }
    setLoading(true);
    try {
      await resetPassword({ email, new_password: password });
      setSuccess(true);
    } catch (err) {
      alert(err.response?.data?.detail || "Đặt lại mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #e0f2f1 0%, #e0f7fa 50%, #e3f2fd 100%)",
      display: "flex", alignItems: "center", justifyContent: "center", p: 2
    }}>
      <Container maxWidth="sm">
        <Card sx={{ borderRadius: 4, boxShadow: "0 20px 60px rgba(0,0,0,0.12)", overflow: "hidden" }}>

          {/* Banner */}
          <Box sx={{
            background: "linear-gradient(135deg, #00897b, #00acc1)",
            p: 5, textAlign: "center"
          }}>
            <Typography fontSize={64} lineHeight={1} mb={1}>🔑</Typography>
            <Typography variant="h5" fontWeight="bold" color="white">
              Đặt lại mật khẩu
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", mt: 0.5 }}>
              {email || "Nhập mật khẩu mới của bạn"}
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>

            {/* Success */}
            {success ? (
              <Box textAlign="center" py={2} spacing={2}>
                <Typography fontSize={64}>✅</Typography>
                <Typography variant="h6" fontWeight="bold" color="#37474f" mt={2}>
                  Đặt lại mật khẩu thành công!
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1} mb={3}>
                  Bạn có thể đăng nhập với mật khẩu mới
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => navigate("/")}
                  sx={{
                    py: 1.5, borderRadius: 3, fontWeight: "bold",
                    background: "linear-gradient(135deg, #00897b, #00acc1)",
                    "&:hover": { background: "linear-gradient(135deg, #00796b, #0097a7)" }
                  }}
                >
                  Đăng nhập ngay →
                </Button>
              </Box>
            ) : (
              <form onSubmit={handleSubmit}>
                <TextField
                  label="🔒 Mật khẩu mới"
                  type="password"
                  fullWidth
                  margin="normal"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    "&.Mui-focused fieldset": { borderColor: "#00897b" }
                  }}}
                />

                <TextField
                  label="🔒 Xác nhận mật khẩu mới"
                  type="password"
                  fullWidth
                  margin="normal"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    "&.Mui-focused fieldset": { borderColor: "#00897b" }
                  }}}
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{
                    mt: 3, py: 1.5, borderRadius: 3, fontWeight: "bold", fontSize: 16,
                    background: "linear-gradient(135deg, #00897b, #00acc1)",
                    boxShadow: "0 4px 15px rgba(0,137,123,0.4)",
                    "&:hover": { background: "linear-gradient(135deg, #00796b, #0097a7)" }
                  }}
                >
                  {loading
                    ? <CircularProgress size={24} sx={{ color: "white" }} />
                    : "Đặt lại mật khẩu"}
                </Button>

                <Button
                  component={Link}
                  to="/"
                  variant="outlined"
                  fullWidth
                  sx={{
                    mt: 2, py: 1.5, borderRadius: 3, fontWeight: "bold",
                    borderColor: "#00897b", color: "#00897b",
                    "&:hover": { borderColor: "#00796b", bgcolor: "#e0f2f1" }
                  }}
                >
                  ← Quay lại đăng nhập
                </Button>
              </form>
            )}
          </CardContent>

          {/* Footer */}
          <Box sx={{ bgcolor: "#f5f5f5", py: 2, textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">
              🔐 Thông tin của bạn được bảo mật tuyệt đối
            </Typography>
          </Box>
        </Card>
      </Container>
    </Box>
  );
}