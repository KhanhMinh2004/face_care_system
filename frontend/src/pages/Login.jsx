import { useState } from "react";
import { login } from "../api/authApi";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box
} from "@mui/material";

export default function Login() {

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      const res = await login({
        email: email,
        password: password
      });
      const accessToken = res.data.access_token;
      const refreshToken = res.data.refresh_token;
      const role = res.data.role;

      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
      localStorage.setItem("role", role);

      if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/analyze");
      }
    } catch (err) {

      alert(err.response.data.detail);

    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <Card sx={{ width: "100%", p: 2, boxShadow: 5 }}>
          <CardContent>

            <Typography
              variant="h5"
              align="center"
              sx={{ mb: 3, color: "#00897b", fontWeight: "bold" }}
            >
              Skin Care System Login
            </Typography>

            <form onSubmit={handleSubmit}>

              <TextField
                label="Email"
                type="email"
                fullWidth
                margin="normal"
                onChange={(e) => setEmail(e.target.value)}
              />

              <TextField
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                onChange={(e) => setPassword(e.target.value)}
              />

              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 2, backgroundColor: "#00897b" }}
                type="submit"
              >
                Login
              </Button>

            </form>

          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}