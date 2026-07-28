import { useState } from "react";
import { forgotPassword } from "../api/authApi";
import { Link } from "react-router-dom";
import {
  Container, Card, CardContent, TextField,
  Button, Typography, Box, CircularProgress
} from "@mui/material";

export default function ForgotPassword() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword({ email });
      setSuccess(true);
    } catch (err) {
      alert(err.response?.data?.detail || "Gửi email thất bại");
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
            <Typography fontSize={64} lineHeight={1} mb={1}>📧</Typography>
            <Typography variant="h5" fontWeight="bold" color="white">
              Quên mật khẩu
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", mt: 0.5 }}>
              Nhập email để nhận link đặt lại mật khẩu
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>

            {/* Success state */}
            {success ? (
              <Box textAlign="center" py={2}>
                <Typography fontSize={64}>✅</Typography>
                <Typography variant="h6" fontWeight="bold" color="#37474f" mt={2}>
                  Email đã được gửi!
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1} mb={3}>
                  Kiểm tra hộp thư của <strong>{email}</strong> và
                  làm theo hướng dẫn để đặt lại mật khẩu
                </Typography>
                <Button
                  component={Link}
                  to="/"
                  variant="contained"
                  fullWidth
                  sx={{
                    py: 1.5, borderRadius: 3, fontWeight: "bold",
                    background: "linear-gradient(135deg, #00897b, #00acc1)",
                    "&:hover": { background: "linear-gradient(135deg, #00796b, #0097a7)" }
                  }}
                >
                  ← Quay lại đăng nhập
                </Button>
              </Box>
            ) : (
              <form onSubmit={handleSubmit}>

                {/* Hướng dẫn */}
                <Box sx={{
                  bgcolor: "#e0f2f1", borderRadius: 3, p: 2, mb: 3,
                  border: "1px solid #b2dfdb"
                }}>
                  <Typography variant="body2" color="#00695c">
                    💡 Chúng tôi sẽ gửi link đặt lại mật khẩu đến email của bạn.
                    Vui lòng kiểm tra cả hộp thư spam.
                  </Typography>
                </Box>

                <TextField
                  label="📧 Email của bạn"
                  type="email"
                  fullWidth
                  margin="normal"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  sx={{ "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    "&.Mui-focused fieldset": { borderColor: "#00897b" }
                  }}}
                />

                {/* Submit */}
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
                    : "Gửi email đặt lại mật khẩu"}
                </Button>

                {/* Back */}
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