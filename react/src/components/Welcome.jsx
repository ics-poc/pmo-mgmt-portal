import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Button,
  Container,
} from "@mui/material";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import BadgeIcon from "@mui/icons-material/Badge";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import TextField from "@mui/material/TextField";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { API_URL } from "../utils/helpers";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const Welcome = ({ isTokenUser }) => {
  const navigate = useNavigate();

  const location = useLocation();
  const tokenError = location.state?.tokenError;
  const [email, setEmail] = React.useState("");
  const [emailError, setEmailError] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const handleGenerateToken = async () => {
    if (!email || !isValidEmail(email)) {
      setEmailError(true);
      return;
    }

    const redirectPath = window.location.pathname;

    try {
      setLoading(true);

      await fetch(
        `${API_URL}/api/auth/create-temp-url?email=${encodeURIComponent(
          email
        )}&redirectPath=${encodeURIComponent(redirectPath)}`,
        {
          method: "POST",
        }
      );

      setSuccess(true);
      setEmail("");
      setEmailError(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const modules = [
    {
      id: "external",
      title: "Candidate Shortlisting System",
      description:
        "Screen and shortlist applicants from external job boards using our AI-driven matching engine.",
      icon: <PersonSearchIcon sx={{ fontSize: 48, color: "#1976d2" }} />,
      buttonText: "Launch Candidate Portal",
      path: "/CandidateShortlistingSystem",
    },
    {
      id: "internal",
      title: "Employee Shortlisting System",
      description:
        "Evaluate current employees for promotions and internal roles based on performance data and skills.",
      icon: <BadgeIcon sx={{ fontSize: 48, color: "#1976d2" }} />,
      buttonText: "Launch Employee Portal",
      path: "/EmployeeShortlistingSystem",
    },
  ];

  return (
    <Container maxWidth="lg">
      {tokenError && (
        <Alert
          severity="error"
          sx={{ mb: 4, borderRadius: 2 }}
          onClose={() => navigate(".", { replace: true })}
        >
          {tokenError}
        </Alert>
      )}

      {/* HEADER */}
      <Box sx={{ mt: 10, mb: 6, textAlign: "center" }}>
        <Typography
          variant="h3"
          sx={{ fontWeight: 700, color: "#1a237e", mb: 2 }}
        >
          Welcome back, Recruiter
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Select a module below to manage your candidates or internal employees.
        </Typography>
      </Box>

      {/* MODULE CARDS */}
      <Box
        sx={{
          mt: -3,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "center",
          alignItems: "stretch",
          gap: 4,
        }}
      >
        {modules.map((module) => (
          <Card
            key={module.id}
            elevation={0}
            sx={{
              width: { xs: "100%", md: "45%" },
              borderRadius: 4,
              border: "1px solid #e3f2fd",
              transition: "transform 0.2s, box-shadow 0.2s",
              display: "flex",
              flexDirection: "column",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 12px 30px rgba(25, 118, 210, 0.12)",
              },
            }}
          >
            <CardActionArea
              onClick={() => navigate(module.path)}
              sx={{
                p: 2,
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <CardContent
                sx={{
                  textAlign: "center",
                  py: 4,
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    display: "inline-flex",
                    p: 2,
                    borderRadius: "50%",
                    bgcolor: "#e3f2fd",
                    mb: 3,
                  }}
                >
                  {module.icon}
                </Box>

                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  {module.title}
                </Typography>

                <Typography
                  variant="body1"
                  color="textSecondary"
                  sx={{ mb: 4, px: 2 }}
                >
                  {module.description}
                </Typography>

                <Box sx={{ mt: "auto" }}>
                  <Button
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      borderRadius: "20px",
                      px: 4,
                      textTransform: "none",
                      fontWeight: 600,
                    }}
                  >
                    {module.buttonText}
                  </Button>
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>

      {/* TEMPORARY LOGIN ACCESS — FULL SPAN OF BOTH CARDS */}
      {!isTokenUser && (
        <Box
          sx={{
            mt: 5,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              width: {
                xs: "100%",
                md: "calc(90% + 32px)", // 45% + gap + 45%
              },
              p: 4,
              borderRadius: 4,
              border: "1px solid #e3f2fd",
              backgroundColor: "#ffffff",
              textAlign: "center",
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 12px 30px rgba(25, 118, 210, 0.12)",
              },
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
              Temporary Login Access
            </Typography>

            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Enter an email ID to generate and send a secure access token.
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <TextField
                label="Email ID"
                variant="outlined"
                value={email}
                onChange={(e) => {
                  const value = e.target.value;
                  setEmail(value);
                  setEmailError(value && !isValidEmail(value));
                }}
                error={emailError}
                helperText={
                  emailError ? "Please enter a valid email address" : ""
                }
                sx={{ width: { xs: "100%", sm: 320 } }}
              />

              <Button
                variant="contained"
                onClick={handleGenerateToken}
                disabled={loading || !email || emailError}
                sx={{
                  px: 4,
                  borderRadius: "20px",
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                {loading ? "Generating…" : "Generate Token"}
              </Button>
            </Box>
          </Box>
        </Box>
      )}
      {/* SUCCESS SNACKBAR */}
      <Snackbar
        open={success}
        autoHideDuration={4000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          Token generated successfully 📩
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Welcome;
