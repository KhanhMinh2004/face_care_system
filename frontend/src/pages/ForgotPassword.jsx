import { useState } from "react";
import { forgotPassword } from "../api/authApi";

import {
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box
} from "@mui/material";

export default function ForgotPassword() {

  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await forgotPassword({ email });

      alert("Reset email sent");

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
              Forgot Password
            </Typography>

            <form onSubmit={handleSubmit}>

              <TextField
                label="Enter your email"
                type="email"
                fullWidth
                margin="normal"
                onChange={(e) => setEmail(e.target.value)}
              />

              <Button
                variant="contained"
                fullWidth
                type="submit"
                sx={{ mt: 2, backgroundColor: "#00897b" }}
              >
                Send Reset Email
              </Button>

            </form>

          </CardContent>

        </Card>

      </Box>

    </Container>

  );
}