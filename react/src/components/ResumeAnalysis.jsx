import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Button, Typography, Stepper, Step, StepLabel, Paper,
  Divider, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Stack,
  Chip, IconButton, Fade, CircularProgress, Tooltip, TextField, InputAdornment,
} from '@mui/material';
import { toast } from 'react-toastify';
import { API_URL } from '../utils/helpers';
import ShortlistDisplayTable from './ShortlistDisplayTable';
import AnalysisResults from './AnalysisResults';
import CloudUpload from '@mui/icons-material/CloudUpload';
import Delete from '@mui/icons-material/Delete';
import Analytics from '@mui/icons-material/Analytics';
import ArrowBack from '@mui/icons-material/ArrowBack';
import Edit from '@mui/icons-material/Edit';
import Save from '@mui/icons-material/Save';
import Cancel from '@mui/icons-material/Cancel';

const STEPS = ['Review Shortlist', 'Upload Resumes', 'View Analysis Results'];

// --- API Helpers ---
const handleUploadResumeApi = async (candidateId, file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("empNo", "1039680"); // Hardcoded as per your existing snippet

    const response = await fetch(`${API_URL}/api/candidate/documents/upload`, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) throw new Error('Failed to upload resume.');
    const result = await response.json();
    toast.success(result.message || `File uploaded for ${candidateId}.`);
    return true;
  } catch (error) {
    toast.error(`Error uploading resume for ${candidateId}.`);
    return false;
  }
};

const handleDeleteResumeApi = async (candidateId) => {
  try {
    const response = await fetch(`${API_URL}/api/candidate/documents/delete/${candidateId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete resume.');
    toast.info(`File deleted for ${candidateId}.`);
    return true;
  } catch (error) {
    toast.error(`Error deleting resume.`);
    return false;
  }
};

const handleAnalyzeResumesApi = async (brId, candidatesForAnalysis, requiredSkills) => {
  try {
    const response = await fetch(`http://localhost:3001/analysis/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brId, candidatesForAnalysis, requiredSkills }),
    });
    if (!response.ok) throw new Error('Failed to trigger analysis.');
    const result = await response.json();
    
    const rawCandidates = result.resultsReady?.candidates || [];
    const formattedResults = rawCandidates
      .filter(c => c && c.employee_name)
      .map(c => {
        const skillMatches = c.individual_skill_match_percent ? Object.values(c.individual_skill_match_percent) : [];
        const averageSkillMatch = skillMatches.length > 0
          ? skillMatches.reduce((sum, val) => sum + val, 0) / skillMatches.length
          : 0;
        const experienceMatch = c.experience_match_percent || 0;
        const overallMatchScore = Math.round((experienceMatch * 0.6) + (averageSkillMatch * 0.4));

        return {
          candidateName: c.employee_name,
          overallMatch: overallMatchScore,
          experience: c.expected_experience || `${c.resume_experience_years || 'N/A'} years`,
          resumeSummary: c.resume_summary || "No summary available",
          rawData: c
        };
      });
    return formattedResults.sort((a, b) => b.overallMatch - a.overallMatch);
  } catch (error) {
    toast.error(`Analysis Error: ${error.message}`);
    return [];
  }
};

// --- Sub-Components ---

function Step1Content({ fullShortlist, handleProceed, onSelectionChange, selectedCandidateIds, isAnalyzing }) {
  const selectedCount = selectedCandidateIds.size;

  const handleFilterAndProceed = () => {
    if (selectedCount === 0) {
      toast.warn('Please select at least one candidate.');
      return;
    }
    const candidatesForAnalysis = fullShortlist.filter(c => 
      selectedCandidateIds.has(c.empNo || c.employeeName || c.id)
    );
    handleProceed(candidatesForAnalysis);
  };

  return (
    <Box sx={{ p: 3, pt: 0 }}>
      <ShortlistDisplayTable
        candidates={fullShortlist}
        title="Candidates Selected for Analysis"
        onSelectionChange={onSelectionChange}
        selectedCandidateIds={selectedCandidateIds}
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, px: 3 }}>
        <Button
          variant="contained"
          onClick={handleFilterAndProceed}
          disabled={isAnalyzing || selectedCount === 0}
          sx={{ fontWeight: '600', borderRadius: '8px', p: '10px 24px' }}
        >
          {`Proceed to Upload (${selectedCount} candidate${selectedCount !== 1 ? 's' : ''})`}
        </Button>
      </Box>
    </Box>
  );
}

function Step2Content({ shortlistedData, selectedFiles, setSelectedFiles, handleGoToAnalysisResults, goToPreviousStep, job, requiredSkills }) {
  const fileInputRefs = useRef({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileChange = async (e, candidate) => {
    const file = e.target.files[0];
    if (!file) return;
    const candidateId = candidate.empNo || candidate.employeeName || candidate.id;
    const uploadSuccess = await handleUploadResumeApi(candidateId, file);
    if (uploadSuccess) {
      setSelectedFiles(prev => ({ ...prev, [candidateId]: file }));
    }
    e.target.value = "";
  };

  const clearFile = async (candidateId) => {
    const deleteSuccess = await handleDeleteResumeApi(candidateId);
    if (deleteSuccess) {
      setSelectedFiles(prev => {
        const updated = { ...prev };
        delete updated[candidateId];
        return updated;
      });
    }
  };

  const handleAnalyzeAll = async () => {
    const uploadedCandidates = shortlistedData.filter(c => selectedFiles[c.empNo || c.employeeName || c.id]);
    setIsAnalyzing(true);
    const results = await handleAnalyzeResumesApi(job.brId, uploadedCandidates, requiredSkills);
    setIsAnalyzing(false);
    if (results.length > 0) handleGoToAnalysisResults(results);
  };

  return (
    <Box sx={{ p: 3, pt: 0.5 }}>
      <Paper elevation={3} sx={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Button startIcon={<ArrowBack />} onClick={goToPreviousStep} sx={{ textTransform: "none" }}>Back</Button>
          <Button
            variant="contained"
            startIcon={isAnalyzing ? <CircularProgress size={18} color="inherit" /> : <Analytics />}
            onClick={handleAnalyzeAll}
            //disabled={isAnalyzing}
            disabled={true}
          >
            {isAnalyzing ? "Analyzing..." : "Analyze All Uploaded"}
          </Button>
        </Box>
        <Divider />
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: "#1976d2", color: "white" }}>Name</TableCell>
                <TableCell sx={{ bgcolor: "#1976d2", color: "white" }}>Grade</TableCell>
                <TableCell sx={{ bgcolor: "#1976d2", color: "white" }}>Skill Match</TableCell>
                <TableCell sx={{ bgcolor: "#1976d2", color: "white", textAlign: "center" }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {shortlistedData.map((c) => {
                const candidateId = c.empNo || c.employeeName || c.id;
                const file = selectedFiles[candidateId];
                return (
                  <TableRow key={candidateId} hover>
                    <TableCell>{c.employeeName || 'N/A'}</TableCell>
                    <TableCell>{c.grade || "—"}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {c['skillMatch%'] && Object.entries(c['skillMatch%']).map(([skill, percent]) => (
                          <Chip key={skill} label={`${skill}: ${percent.toFixed(1)}%`} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                      <input
                        type="file"
                        style={{ display: "none" }}
                        ref={el => fileInputRefs.current[candidateId] = el}
                        onChange={(e) => handleFileChange(e, c)}
                      />
                      {!file ? (
                        <Button startIcon={<CloudUpload />} onClick={() => fileInputRefs.current[candidateId].click()}>Upload</Button>
                      ) : (
                        <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                          <Chip label={file.name} size="small" color="primary" />
                          <IconButton size="small" color="error" onClick={() => clearFile(candidateId)}><Delete fontSize="small"/></IconButton>
                        </Stack>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

const StaticDetailBox = ({ label, value }) => (
  <Box sx={{ minWidth: 150, mb: 1 }}>
    <Typography variant="body1" sx={{ fontWeight: 600 }}>
      <Box component="span" sx={{ color: 'text.primary', mr: 0.5 }}>{label}:</Box>
      <Box component="span" sx={{ fontWeight: 500, color: 'text.secondary' }}>{value || 'N/A'}</Box>
    </Typography>
  </Box>
);

// --- MAIN COMPONENT ---
function ResumeAnalysis({
  goToAnalysisResults,
  goToShortlist,
  shortlistedData,
  requiredSkills,
  selectedJobDetail,
  selectedFiles,
  setSelectedFiles,
  onUpdateSkills // Callback to App.js to trigger the /match-skills/edit API
}) {
  const [activeStep, setActiveStep] = useState(0);
  const [analysisResults, setAnalysisResults] = useState([]);
  const [candidatesToAnalyzeIds, setCandidatesToAnalyzeIds] = useState(new Set());
  const [candidatesToAnalyzeData, setCandidatesToAnalyzeData] = useState([]);

  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [editingSkillsText, setEditingSkillsText] = useState(requiredSkills || '');

  // Keep local text field in sync with global state from App.js
  useEffect(() => {
    setEditingSkillsText(requiredSkills);
  }, [requiredSkills]);

  // Update selection whenever shortlistedData changes from the backend
  useEffect(() => {
    const ids = new Set(shortlistedData.map(c => c.empNo || c.employeeName || c.id));
    setCandidatesToAnalyzeIds(ids);
  }, [shortlistedData]);

  const handleApplySkillChange = async () => {
    if (editingSkillsText.trim() === requiredSkills.trim()) {
      setIsEditingSkills(false);
      return;
    }
    const success = await onUpdateSkills(editingSkillsText.trim());
    if (success) setIsEditingSkills(false);
  };

  const handleCancelEdit = () => {
    setEditingSkillsText(requiredSkills);
    setIsEditingSkills(false);
  };

  const job = {
    brId: selectedJobDetail?.brId || 'N/A',
    client: selectedJobDetail?.client || 'N/A',
    grade: selectedJobDetail?.grade || 'N/A',
  };

  const goToPreviousStep = () => {
    if (activeStep === 2) setActiveStep(1);
    else if (activeStep === 1) setActiveStep(0);
    else goToShortlist();
  };

  return (
    <Box sx={{ p: 5, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ width: '100%', mb: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {STEPS.map((label) => (
            <Step key={label}><StepLabel>{label}</StepLabel></Step>
          ))}
        </Stepper>
      </Box>

      <Box sx={{ bgcolor: '#f8fbff', border: '1px solid #bbdefb', borderRadius: 3, p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
          <StaticDetailBox label="BR ID" value={job.brId} />
          <StaticDetailBox label="Client Name" value={job.client} />
          <StaticDetailBox label="Grade" value={job.grade} />
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>Required Skills:</Typography>
            <TextField
              fullWidth
              size="small"
              value={isEditingSkills ? editingSkillsText : requiredSkills}
              onChange={(e) => setEditingSkillsText(e.target.value)}
              InputProps={{
                readOnly: !isEditingSkills,
                endAdornment: (
                  <InputAdornment position="end">
                    {isEditingSkills ? (
                      <Stack direction="row" spacing={0.5}>
                        <IconButton onClick={handleApplySkillChange} color="primary"><Save fontSize="small" /></IconButton>
                        <IconButton onClick={handleCancelEdit} color="error"><Cancel fontSize="small" /></IconButton>
                      </Stack>
                    ) : (
                      <IconButton onClick={() => setIsEditingSkills(true)} disabled={activeStep !== 0}><Edit fontSize="small" /></IconButton>
                    )}
                  </InputAdornment>
                ),
                sx: { bgcolor: isEditingSkills ? 'white' : '#f0f0f0' }
              }}
            />
          </Box>
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1 }}>
        {activeStep === 0 && (
          <Fade in={activeStep === 0} unmountOnExit>
            <Box>
              <Step1Content
                fullShortlist={shortlistedData}
                selectedCandidateIds={candidatesToAnalyzeIds}
                onSelectionChange={(ids) => setCandidatesToAnalyzeIds(new Set(ids))}
                handleProceed={(data) => { setCandidatesToAnalyzeData(data); setActiveStep(1); }}
              />
            </Box>
          </Fade>
        )}
        {activeStep === 1 && (
          <Fade in={activeStep === 1} unmountOnExit>
            <Box>
              <Step2Content
                shortlistedData={candidatesToAnalyzeData}
                selectedFiles={selectedFiles}
                setSelectedFiles={setSelectedFiles}
                handleGoToAnalysisResults={(res) => { setAnalysisResults(res); setActiveStep(2); }}
                goToPreviousStep={goToPreviousStep}
                job={job}
                requiredSkills={requiredSkills}
              />
            </Box>
          </Fade>
        )}
        {activeStep === 2 && (
          <Fade in={activeStep === 2} unmountOnExit>
            <Box>
              <AnalysisResults analysisResults={analysisResults} goToPreviousStep={goToPreviousStep} />
            </Box>
          </Fade>
        )}
      </Box>
    </Box>
  );
}

export default ResumeAnalysis;