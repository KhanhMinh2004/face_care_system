import { useState } from "react";
import { resetPassword } from "../api/authApi";
import { useSearchParams } from "react-router-dom";

import {
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box
} from "@mui/material";

export default function ResetPassword() {

  const [params] = useSearchParams();
  const email = params.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Password confirmation does not match");
      return;
    }

    try {

      await resetPassword({
        email: email,
        new_password: password
      });

      alert("Password updated");

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
              Reset Password
            </Typography>

            <form onSubmit={handleSubmit}>

              <TextField
                label="New Password"
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
                Reset Password
              </Button>

            </form>

          </CardContent>

        </Card>

      </Box>

    </Container>

  );
}