import React from "react";
import { Box, Stepper, Step, StepLabel, Typography } from "@mui/material";

const StepperSection = ({ activeStep }) => {
  const steps = ["Upload Resume", "Resume Analysis"];

  return (
    <Box sx={{ maxWidth: "500px", mx: "auto", mb: 4, mt: 2 }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel
              StepIconProps={{
                sx: {
                  color:
                    index === activeStep
                      ? "#1976d2 !important" // 🔵 Blue for current
                      : "#cfd8dc !important", // ⚪ Grey for inactive
                },
              }}
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  color: index === activeStep ? "#1976d2" : "#9e9e9e",
                }}
              >
                {label}
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default StepperSection;