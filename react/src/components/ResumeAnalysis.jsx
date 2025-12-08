import React, { useState, useRef, useEffect } from 'react'; // Added useEffect for initialization
import {
  Box,
  Button,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Divider,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Stack,
  Chip,
  IconButton,
  Fade,
  CircularProgress, // Added for loading states
} from '@mui/material';
import { toast } from 'react-toastify';
import { API_URL } from '../utils/helpers';

// Import reusable components
import ShortlistDisplayTable from './ShortlistDisplayTable';
import FilterAndShortlist from './FilterAndShortlist';
import AnalysisResults from './AnalysisResults';

// Icons
import CloudUpload from '@mui/icons-material/CloudUpload';
import Delete from '@mui/icons-material/Delete';
import Analytics from '@mui/icons-material/Analytics';
import ArrowBack from '@mui/icons-material/ArrowBack';

const STEPS = [
  'Review Shortlist',
  'Upload Resumes',
  'View Analysis Results', // Step 3
];


// --- API Handlers (Shared in Step2Content) ---

// 2. Post call for uploading resume
const handleUploadResumeApi = async (candidateId, file) => {
    try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("empNo", "1039680");

        const response = await fetch(`${API_URL}/api/candidate/documents/upload`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) throw new Error('Failed to upload resume via API.');
        
        const result = await response.json();
        toast.success(result.message || `File uploaded for ${candidateId}.`);
        return true;
    } catch (error) {
        console.error("Upload API Error:", error);
        toast.error(`Error uploading resume for ${candidateId}.`);
        return false;
    }
}

// 2. Delete call for deleting the resume 
const handleDeleteResumeApi = async (candidateId) => {
    try {
        const response = await fetch(`${API_URL}/api/candidate/documents/delete/${candidateId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        });
        
        if (!response.ok) throw new Error('Failed to delete resume via API.');
        
        const result = await response.json();
        toast.info(result.message || `File deleted for ${candidateId}.`);
        return true;
    } catch (error) {
        console.error("Delete API Error:", error);
        toast.error(`Error deleting resume for ${candidateId}.`);
        return false;
    }
}

// 3. Post/put call for Analyze resumes
const handleAnalyzeResumesApi = async (brId, candidatesForAnalysis, requiredSkills) => {
    try {
        const response = await fetch(`http://localhost:3001/analysis/trigger`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ brId, candidatesForAnalysis, requiredSkills }),
        });
        
        if (!response.ok) throw new Error('Failed to trigger analysis via API.');
        
        const result = await response.json();
        toast.success(result.message || "Analysis successfully triggered!");
        
        // --- CRITICAL FIX START: Map new API data structure to expected AnalysisResults format ---
        const rawCandidates = result.resultsReady?.candidates || [];

        const formattedResults = rawCandidates
            .filter(c => c && c.employee_name) // Filter out placeholder/empty objects
            .map(c => {
                // Calculate a simple average of skill match percentages to get a combined score
                const skillMatches = c.individual_skill_match_percent ? Object.values(c.individual_skill_match_percent) : [];
                const averageSkillMatch = skillMatches.length > 0 
                    ? skillMatches.reduce((sum, val) => sum + val, 0) / skillMatches.length 
                    : 0;

                // Use a weighted average: 60% Experience, 40% Skill Match for Overall Match
                const experienceMatch = c.experience_match_percent || 0;
                const overallMatchScore = Math.round((experienceMatch * 0.6) + (averageSkillMatch * 0.4));

                return {
                    // Mapped Candidate Name
                    candidateName: c.employee_name, 
                    // Calculate Overall Match (required for sorting and progress bar in AnalysisResults.jsx)
                    overallMatch: overallMatchScore, 
                    // Mapped Experience string
                    experience: c.expected_experience || `${c.resume_experience_years || 'N/A'} years`, 
                    // Mapped Resume Summary
                    resumeSummary: c.resume_summary || c.preview_text || "No summary available",
                    // Pass the raw object for detailed view in AnalysisResults.jsx
                    rawData: c 
                };
            });
        
        // Sort the results by overallMatch descending
        formattedResults.sort((a, b) => b.overallMatch - a.overallMatch);

        return formattedResults; // Return the mapped, sorted array
        // --- CRITICAL FIX END ---

    } catch (error) {
        console.error("Analysis API Error:", error);
        toast.error(`Error triggering analysis: ${error.message}`);
        return [];
    }
}


/**
 * Step2Content Component: Handles the resume file upload screen.
 */
function Step2Content({
  shortlistedData, 
  selectedFiles,
  setSelectedFiles,
  handleGoToAnalysisResults, 
  goToPreviousStep,
  job,
  requiredSkills, // Passed down from parent ResumeAnalysis
}) {
  const fileInputRefs = useRef({});
  const [isAnalyzing, setIsAnalyzing] = useState(false); // Local state for analysis button loading

  const validTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const openFilePicker = (candidateId) => {
    fileInputRefs.current[candidateId]?.click();
  };

  const handleFileChange = async (e, candidate) => { // MADE ASYNC
    const file = e.target.files[0];
    if (!file) return;

    if (!validTypes.includes(file.type)) {
      toast.error("Only PDF, DOC, or DOCX files are allowed.");
      e.target.value = "";
      return;
    }
    
    // NOTE: For the new data structure, the ID is employeeName
    const candidateId = candidate.employeeName || candidate.id; 
    
    // 1. Trigger API Upload
    const uploadSuccess = await handleUploadResumeApi(candidateId, file);

    if (uploadSuccess) {
        // 2. Update local state only on API success
        setSelectedFiles((prev) => ({
          ...prev,
          [candidateId]: file,
        }));
    }
    e.target.value = ""; // Reset file input after selection
  };

  const clearFile = async (candidateId) => { // MADE ASYNC
    // 1. Trigger API Delete
    const deleteSuccess = await handleDeleteResumeApi(candidateId);

    if (deleteSuccess) {
        // 2. Update local state only on API success
        setSelectedFiles((prev) => {
          const updated = { ...prev };
          delete updated[candidateId];
          return updated;
        });
    }
  };

  const handleAnalyzeAll = async () => { // MADE ASYNC
    const uploadedCandidates = shortlistedData.filter((c) => {
      // Use employeeName for ID check for the new data structure
      const candidateId = c.employeeName || c.id; 
      return selectedFiles[candidateId];
    });
    
    // if (uploadedCandidates.length === 0) {
    //   toast.error("Please upload at least one resume before analysis.");
    //   return;
    // }
    
    const missingFiles = shortlistedData.length - uploadedCandidates.length;
    if (missingFiles > 0) {
        toast.warn(`Analyzing ${uploadedCandidates.length} of ${shortlistedData.length} selected candidates. ${missingFiles} resumes are missing.`);
    } 

    setIsAnalyzing(true);

    // 3. Trigger API Analysis (POST /analysis/trigger)
    const results = await handleAnalyzeResumesApi(
        job.brId, 
        uploadedCandidates, 
        requiredSkills
    );
    
    setIsAnalyzing(false);
    
    if (results.length > 0) {
        // Call the prop function to move to Step 3 and pass results
        handleGoToAnalysisResults(results); 
    } else {
        toast.error("Analysis completed but returned no results.");
    }
  };

  const truncateFileName = (name) => {
    if (!name || name.length <= 13) return name;
    return `${name.slice(0, 10)}...`;
  };

  // Mock score is no longer needed since API handles analysis
  const getMockScore = (skill) => {
    if (!skill || skill === '—') return 0;
    return Math.floor(Math.random() * 31) + 65; 
  }

  // NOTE: Removed getSkillMatchDetails helper function

  return (
    <Box
      sx={{
        flex: 1,
        p: 3,
        pt: 0.5,
        display: "flex",
        flexDirection: "column",
        // Removed fixed height property
      }}
    >
      <Paper
        elevation={3}
        sx={{
          // Removed flex: 1 to allow content to shrink-wrap
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* === Upload Resumes + Analyze Button === */}
       <Box sx={{ p: 2, display: "inline-flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Upload Resumes
            </Typography>
          </Box>
          {/* Analyze All Button */}
          <Button
            variant="contained"
            color="primary"
            startIcon={isAnalyzing ? <CircularProgress size={18} color="inherit" /> : <Analytics />}
            onClick={handleAnalyzeAll}
            disabled={shortlistedData.length === 0 || isAnalyzing}
            sx={{ fontWeight: 600, textTransform: "none" }}
          >
            {isAnalyzing ? "Analyzing..." : "Analyze All Uploaded"}
          </Button>
        </Box>
        <Divider />
        {/* === TABLE === */}
        {shortlistedData.length === 0 ? (
          <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#888" }}>
            <Typography>No candidates selected for analysis.</Typography>
          </Box>
        ) : (
          <TableContainer 
            // Removed fixed height/flex: 1 properties to allow content to define size
            sx={{ overflow: "auto" }}
          >
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: "#1976d2", color: "white", fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ bgcolor: "#1976d2", color: "white", fontWeight: 600 }}>Grade</TableCell>
                  {/* NOTE: Using Top 3 Skills for mock display in this table */}
                  <TableCell sx={{ bgcolor: "#1976d2", color: "white", fontWeight: 600 }}>Top 3 Skills</TableCell>
                  {/* MODIFICATION 1: Combined Skill Match into a single column */}
                  <TableCell sx={{ bgcolor: "#1976d2", color: "white", fontWeight: 600 }}>Skill Match</TableCell> 
                  <TableCell sx={{ bgcolor: "#1976d2", color: "white", fontWeight: 600, textAlign: "center" }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {shortlistedData.map((c) => {
                  // Use employeeName for ID check for the new data structure
                  const candidateId = c.employeeName || c.id; 
                  const file = selectedFiles[candidateId];
                  
                  const skill = c.top3Skills || "—";

                  return (
                    <TableRow key={candidateId} hover>
                      <TableCell>{c.employeeName || c.candidateName || 'N/A'}</TableCell>
                      <TableCell>{c.grade || "—"}</TableCell>
                      <TableCell>{skill}</TableCell>
                      
                      {/* MODIFICATION 2: Skill Match Breakdown in Chips */}
                      <TableCell>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {c['skillMatch%'] && Object.entries(c['skillMatch%']).map(([skill, percent]) => (
                                  <Chip
                                      key={skill}
                                      label={`${skill}: ${percent.toFixed(2)}%`}
                                      size="small"
                                      sx={{ 
                                          bgcolor: "#e3f2fd", // Light blue background
                                          color: "#1565c0", // Dark blue text
                                          fontWeight: 500,
                                          fontSize: "0.75rem",
                                      }}
                                  />
                              ))}
                              {(!c['skillMatch%'] || Object.keys(c['skillMatch%']).length === 0) && (
                                  <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.9rem' }}>N/A</Typography>
                              )}
                          </Box>
                      </TableCell>
                      <TableCell sx={{ textAlign: "center", py: 1 }}>
                        <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
                          <input
                            ref={(el) => {
                              if (el) fileInputRefs.current[candidateId] = el;
                            }}
                            type="file"
                            accept=".pdf,.doc,.docx"
                            style={{ display: "none" }}
                            onChange={(e) => handleFileChange(e, c)}
                            disabled={isAnalyzing}
                          />
                          {!file ? (
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<CloudUpload />}
                              onClick={() => openFilePicker(candidateId)}
                              disabled={isAnalyzing}
                              sx={{
                                minWidth: 80,
                                fontSize: "0.75rem",
                                bgcolor: "#1976d2",
                                color: "white",
                                "&:hover": { bgcolor: "#1565c0" },
                                py: 0.5,
                              }}
                            >
                              Upload
                            </Button>
                          ) : (
                            <>
                              <Chip
                                label={truncateFileName(file.name)}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{
                                  fontSize: "0.65rem",
                                  maxWidth: 95,
                                  height: 28,
                                  "& .MuiChip-label": {
                                    px: 1,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  },
                                }}
                              />
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => clearFile(candidateId)}
                                disabled={isAnalyzing}
                                sx={{
                                  width: 28,
                                  height: 28,
                                  p: 0,
                                }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}


/**
 * Step1Content Component: Handles the final review and button to proceed to upload.
 */
function Step1Content({
    fullShortlist, 
    isApiReady,
    isAnalyzing,
    handleProceed, 
    onSelectionChange, 
    selectedCandidateIds, 
    brId, // Added brId prop
}) {
    // NOTE: Removed isSubmitting and handleSubmitSelectionApi as the API call is now client-side logic.
    const selectedCount = selectedCandidateIds.size;

    // Handler to filter the data based on selection and pass it to the next step
    const handleFilterAndProceed = () => {
        if (selectedCount === 0) {
            toast.warn('Please select at least one candidate to proceed.');
            return;
        }
        
        // 1. Filter the full list based on the selected IDs
        // The ID is the 'employeeName' for the new data structure, and 'id' for old/other data
        const candidatesForAnalysis = fullShortlist.filter(c => 
            selectedCandidateIds.has(c.employeeName || c.id)
        );

        // 2. Call the parent handler to move to the next step (Step 2)
        handleProceed(candidatesForAnalysis);
    };

    return (
        <Box sx={{ p: 3, mb: 4, pt: 0 }}>
            
            <ShortlistDisplayTable
                candidates={fullShortlist}
                title="Candidates Selected for Analysis"
                // Pass the handler to the table component
                onSelectionChange={onSelectionChange} 
                // Pass the current selection state for initial tick marks and persistence
                selectedCandidateIds={selectedCandidateIds}
            />

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, px: 3 }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleFilterAndProceed}
                    disabled={isAnalyzing || selectedCount === 0}
                    sx={{
                        bgcolor: '#4da6ff',
                        color: 'white',
                        '&:hover': {
                            bgcolor: '#1976d2',
                        },
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        p: '10px 24px',
                        borderRadius: '8px'
                    }}
                >
                    {`Proceed to Upload Resumes (${selectedCount} candidate${selectedCount !== 1 ? 's' : ''})`}
                </Button>
                {!isApiReady && (
                    <Typography variant="body2" color="error" sx={{ alignSelf: 'center', ml: 2 }}>
                        API_URL is not set. Using Mock Analysis flow.
                    </Typography>
                )}
            </Box>
        </Box>
    );
}

/**
 * ResumeAnalysis Component: The main container managing the steps.
 */
function ResumeAnalysis({
  goToAnalysisResults,
  goToShortlist,
  shortlistedData, 
  requiredSkills,
  brId,
  selectedJobDetail,
  selectedFiles,
  setSelectedFiles,
}) {
  const [activeStep, setActiveStep] = useState(0); 
  const [isAnalyzing, setIsAnalyzing] = useState(false); 
  const [analysisResults, setAnalysisResults] = useState([]); 
  
  // State to hold the IDs of the candidates checked in Step 1
  const [candidatesToAnalyzeIds, setCandidatesToAnalyzeIds] = useState(new Set());
  // State to hold the actual filtered data for analysis (passed to Step 2)
  const [candidatesToAnalyzeData, setCandidatesToAnalyzeData] = useState([]);

  // Fix: Initialize the selection state when the full shortlist is loaded, only if the state is currently empty.
  useEffect(() => {
    if (shortlistedData.length > 0 && candidatesToAnalyzeIds.size === 0) {
      // Select all candidates initially. Use employeeName for new data, or id for old.
      const allIds = new Set(shortlistedData.map(c => c.employeeName || c.id).filter(id => id !== undefined));
      setCandidatesToAnalyzeIds(allIds);
      // Also set the initial data to be the full shortlist
      setCandidatesToAnalyzeData(shortlistedData);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortlistedData.length]); // Depend on length to trigger when data arrives


  // Define job object using available props
  const job = {
    brId: selectedJobDetail?.brId || brId || 'N/A',
    client: selectedJobDetail?.client || 'N/A',
    grade: selectedJobDetail?.grade || 'N/A',
  };

  // Check if API_URL is configured
  const isApiReady = Boolean(API_URL);

  // Handler passed to ShortlistDisplayTable to update the selected IDs set
  const handleSelectedIdsChange = (idsArray) => {
    setCandidatesToAnalyzeIds(new Set(idsArray));
  };


  // Handler passed to Step1Content to receive the *filtered* data and move to Step 2
  const handleProceedToUpload = (filteredCandidatesData) => {
    if (filteredCandidatesData.length === 0) {
        toast.warn('No candidates selected for analysis. Please check at least one candidate.');
        return;
    }
    // Set the filtered data that will be passed down to Step 2
    setCandidatesToAnalyzeData(filteredCandidatesData);
    setActiveStep(1); // Move to the Upload step
  };


  // Function to handle results passing and step change to Step 3
  const handleGoToAnalysisResults = (results) => {
    setAnalysisResults(results);
    setActiveStep(2); // Move to the Results step
  }


  const goToPreviousStep = () => {
    if (activeStep === 2) {
      setActiveStep(1); // Go back from Results to Upload
    } else if (activeStep === 1) {
      setActiveStep(0); // Go back from Upload to Review
    } else {
      goToShortlist(); // Go back from Review to Shortlisting screen
    }
  };


  return (
    <Box 
        sx={{ 
            p: 5, 
            minHeight: '50vh', 
            display: 'flex', 
            flexDirection: 'column' 
        }}
    >
      {/* 🌟 MUI Stepper Component - STATIC HEADER */}
      <Box sx={{ width: '100%', mb: 4, flexShrink: 0 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {STEPS.map((label, index) => (
            <Step key={label}>
              <StepLabel StepIconProps={{ style: { color: activeStep >= index ? '#1976d2' : '#94a3b8' } }}>
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
      {/* -------------------------------------- */}

      {/* --- Job Requirements Overview - STATIC HEADER --- */}
     <Box sx={{
        p: 0,
        maxWidth: '1550px',
        margin: '0 auto',
        width: '100%',
        flexShrink: 0
    }}>
        <Box sx={{
            bgcolor: '#f8fbff',
            border: '1px solid #bbdefb',
            borderRadius: 3,
            pt: 2,  
            px: 1.5,  
            pb: 0,  
            mt: 0,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            maxWidth: '1500px',
            mx: 'auto'
        }}>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <FilterAndShortlist label="BR ID" value={job.brId} />
                <FilterAndShortlist label="Client Name" value={job.client} />
                <FilterAndShortlist label="Grade" value={job.grade || ''} />
                <Box sx={{ flex: 1 }}>
                    <FilterAndShortlist label="Required Skills" value={requiredSkills} />
                </Box>
            </Box>
        </Box>
    </Box>

      {/* ----------------------------------------------------------------------------- */}

      {/* Conditionally Render Content based on Step */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', pt: 3 }}>
        {/* Step 1: Review Shortlist */}
        <Fade in={activeStep === 0} unmountOnExit>
            <Box sx={{ width: '100%' }}>
                <Step1Content
                    fullShortlist={shortlistedData} 
                    selectedCandidateIds={candidatesToAnalyzeIds} 
                    onSelectionChange={handleSelectedIdsChange} 
                    isApiReady={isApiReady}
                    isAnalyzing={isAnalyzing}
                    handleProceed={handleProceedToUpload} 
                    brId={job.brId} // Pass BR ID for API call
                />
            </Box>
        </Fade>

        {/* Step 2: Upload Resumes */}
        <Fade in={activeStep === 1} unmountOnExit>
            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                <Step2Content
                    shortlistedData={candidatesToAnalyzeData} 
                    selectedFiles={selectedFiles}
                    setSelectedFiles={setSelectedFiles}
                    handleGoToAnalysisResults={handleGoToAnalysisResults} 
                    goToPreviousStep={goToPreviousStep}
                    job={job}
                    requiredSkills={requiredSkills} // Pass skills for analysis trigger
                />
            </Box>
        </Fade>

        {/* Step 3: View Analysis Results */}
        <Fade in={activeStep === 2} unmountOnExit>
            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                <AnalysisResults 
                    analysisResults={analysisResults}
                    goToPreviousStep={goToPreviousStep}
                />
            </Box>
        </Fade>
      </Box>
    </Box>
  );
}

export default ResumeAnalysis;