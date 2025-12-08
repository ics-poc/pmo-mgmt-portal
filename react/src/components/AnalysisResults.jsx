import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Divider,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Fade,
  Chip, // Added Chip for displaying skill breakdown
} from '@mui/material';
// Icons needed for the Analysis Results View
import ArrowBack from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';

/**
 * AnalysisResults Component: Displays the analysis results in a table.
 * This component represents the content of Step 3 in the main flow.
 */
function AnalysisResults({ analysisResults, goToPreviousStep }) {
  const [expandedRow, setExpandedRow] = useState(null);

  const handleAccordionToggle = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  // results is already sorted by overallMatch descending from ResumeAnalysis.jsx
  const results = analysisResults; 

  return (
    <Fade in timeout={800}>
      <Box
        sx={{
          p: 3,
          pt: 0.5,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* === Analysis Results HEADING === */}
          <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Button
                startIcon={<ArrowBack />}
                onClick={goToPreviousStep}
                sx={{
                  color: "#1976d2",
                  fontWeight: 600,
                  textTransform: "none",
                  bgcolor: "rgba(25,118,210,0.08)",
                  borderRadius: 3,
                  "&:hover": { bgcolor: "rgba(25,118,210,0.15)" },
                }}
              >
                Back
              </Button>
              <Typography variant="h6" sx={{ color: "#000", fontWeight: 600, m: 0 }}>
                Analysis Results
              </Typography>
            </Box>
            <Box /> {/* Empty space on right */}
          </Box>
          <Divider />
          {/* === TABLE === */}
          {results.length === 0 ? (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#888", p: 4 }}>
              <Typography>No analysis results available.</Typography>
            </Box>
          ) : (
            <TableContainer sx={{ overflow: "auto" }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ bgcolor: "#1976d2", color: "white", fontWeight: 600 }}>
                      Rank
                    </TableCell>
                    <TableCell sx={{ bgcolor: "#1976d2", color: "white", fontWeight: 600 }}>
                      Candidate
                    </TableCell>
                    {/* MODIFICATION: Added Grade Column */}
                    <TableCell sx={{ bgcolor: "#1976d2", color: "white", fontWeight: 600 }}>
                      Grade
                    </TableCell>
                    <TableCell sx={{ bgcolor: "#1976d2", color: "white", fontWeight: 600 }}>
                      Overall Match
                    </TableCell>
                    <TableCell sx={{ bgcolor: "#1976d2", color: "white", fontWeight: 600 }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.map((r, i) => (
                    <React.Fragment key={r.candidateName}>
                      <TableRow hover sx={{ bgcolor: i % 2 === 0 ? "#fdfdfd" : "#f7faff" }}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>{r.candidateName || "—"}</TableCell>

                        {/* MODIFICATION: Grade Cell */}
                        {/* Accessing grade from the rawData property */}
                        <TableCell>{r.rawData?.grade || "—"}</TableCell>

                        {/* Overall Match Bar */}
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Box
                              sx={{
                                width: 80,
                                height: 8,
                                bgcolor: "#f0f0f0",
                                borderRadius: 1,
                                overflow: "hidden",
                              }}
                            >
                              <Box
                                sx={{
                                  height: "100%",
                                  width: `${r.overallMatch}%`,
                                  bgcolor:
                                    r.overallMatch >= 80
                                      ? "#28a745"
                                      : r.overallMatch >= 50
                                      ? "#ffc107"
                                      : r.overallMatch >= 30
                                      ? "#ff8c00"
                                      : "#dc3545",
                                }}
                              />
                            </Box>
                            <Typography variant="body2">{r.overallMatch}%</Typography>
                          </Box>
                        </TableCell>

                        {/* Details Button */}
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            color="primary"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleAccordionToggle(i)}
                            sx={{
                              fontSize: "0.75em",
                              fontWeight: "bold",
                              textTransform: "uppercase",
                              p: "4px 8px",
                            }}
                          >
                            {expandedRow === i ? "Hide" : "Details"}
                          </Button>
                        </TableCell>
                      </TableRow>

                      {/* Expanded Details - Uses the fields from the new API response structure via r.rawData */}
                      <TableRow sx={{ display: expandedRow === i ? 'table-row' : 'none' }}>
                        {/* CRITICAL FIX: colSpan must now be 5 to span all parent columns (Rank, Candidate, Grade, Overall Match, Actions) */}
                        <TableCell colSpan={5} sx={{ p: 0 }}> 
                          <Box sx={{ p: 2, bgcolor: '#e3f2fd', borderBottom: '1px solid #bbdefb' }}>
                              
                            {/* Experience Details */}
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                <Typography component="span" sx={{ fontWeight: 600 }}>Experience Match:</Typography>
                                <Typography component="span" sx={{ fontWeight: 500, ml: 1, color: '#1565c0' }}>
                                    {r.rawData?.experience_match_percent !== undefined 
                                        ? `${r.rawData.experience_match_percent}%`
                                        : "N/A"}
                                </Typography>
                                <Typography component="span" sx={{ fontWeight: 400, ml: 1, color: '#607d8b' }}>
                                    (Candidate: {r.rawData?.resume_experience_years || 'N/A'} years, Expected: {r.experience || 'N/A'})
                                </Typography>
                            </Typography>
                            
                            {/* Detailed Skill Match Breakdown */}
                            {r.rawData?.individual_skill_match_percent && (
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    <Typography component="span" sx={{ fontWeight: 600, display: 'block' }}>Skill Match Breakdown:</Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                                        {Object.entries(r.rawData.individual_skill_match_percent).map(([skill, percent]) => (
                                            <Chip
                                                key={skill}
                                                label={`${skill}: ${percent}%`}
                                                size="small"
                                                sx={{ 
                                                    bgcolor: "#bbdefb", 
                                                    color: "#1565c0", 
                                                    fontWeight: 500,
                                                    fontSize: "0.75rem",
                                                }}
                                            />
                                        ))}
                                    </Box>
                                </Typography>
                            )}

                            {/* Resume Summary */}
                            <Typography variant="body2" sx={{ fontWeight: 600, mt: 1 }}>
                              Resume Summary:
                              <Typography component="span" variant="body2" sx={{ fontWeight: 400, ml: 0.5 }}>
                                {r.resumeSummary || "No summary available"}
                              </Typography>
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>
    </Fade>
  );
}

export default AnalysisResults;