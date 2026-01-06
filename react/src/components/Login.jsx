import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Alert from "@mui/material/Alert";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { toast } from "react-toastify";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import AccountCircle from "@mui/icons-material/AccountCircle";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { API_URL } from "../utils/helpers";

// ---- API CALL ----
const handleLoginApi = async (username, password) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const result = await response.json();

    if (response.ok) {
      return {
        success: true,
        user: result.username,
      };
    } else {
      return {
        success: false,
        message: result.message || "Authentication failed",
      };
    }
  } catch (error) {
    console.error("API Error:", error);
    return {
      success: false,
      message: "Failed to connect to the server.",
    };
  }
};

// ---- COMPONENT ----
const Login = ({ handleLoginSuccess }) => {
  const location = useLocation();
  const rawTokenError = location.state?.tokenError;

  const tokenError =
    rawTokenError === "Link expired"
      ? "Application Access Denied as the Token has Expired"
      : rawTokenError === "Invalid link"
      ? "Application Access Denied as the Token is Invalid"
      : rawTokenError;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("Please enter both username and password.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await handleLoginApi(username, password);

      if (result.success) {
        handleLoginSuccess();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Login Error:", error);
      toast.error("An unexpected error occurred during login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 400 }}>
      {/* 🔴 ERROR BANNER ON TOP */}
      {tokenError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {tokenError}
        </Alert>
      )}

      {/* LOGIN CARD */}
      <Paper
        elevation={8}
        sx={{
          p: 5,
          width: "100%",
          borderRadius: 3,
          textAlign: "center",
          boxShadow: "0 10px 30px rgba(25, 118, 210, 0.2)",
          borderTop: "5px solid #1976d2",
        }}
      >
        <Box sx={{ mb: 3 }}>
          <LockOutlinedIcon color="primary" sx={{ fontSize: 40 }} />
          <Typography
            variant="h5"
            component="h1"
            sx={{ mt: 1, fontWeight: 600, color: "#1976d2" }}
          >
            Welcome
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Sign in to continue to the system.
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          {/* Username */}
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircle color="primary" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          {/* Password */}
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon color="primary" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />

          {/* Submit */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            sx={{
              mt: 2,
              p: 1.5,
              fontWeight: 700,
              backgroundColor: "#1976d2",
              "&:hover": { backgroundColor: "#1565c0" },
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Sign In"
            )}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
