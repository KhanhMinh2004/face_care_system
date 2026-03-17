import { useState } from "react";
import { register } from "../api/authApi";

import {
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box
} from "@mui/material";

export default function Register() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Password confirmation does not match");
      return;
    }

    try {

      await register({
        email: email,
        password: password,
        confirm_password: confirmPassword
      });

      alert("Register success");

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
              Create Account
            </Typography>

            <form onSubmit={handleSubmit}>

              <TextField
                label="Email"
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

              <TextField
                label="Confirm Password"
                type="password"
                fullWidth
                margin="normal"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <Button
                variant="contained"
                fullWidth
                type="submit"
                sx={{ mt: 2, backgroundColor: "#00897b" }}
              >
                Register
              </Button>

            </form>

          </CardContent>

        </Card>

      </Box>
    </Container>
  );
}