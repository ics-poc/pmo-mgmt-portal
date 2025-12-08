import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import {
  createTheme,
  ThemeProvider,
  CssBaseline,
  Box,
  CircularProgress,
  Paper,
  LinearProgress,
} from '@mui/material';
import Header from './Header';
import ProgressSteps from './ProgressSteps';
import JobRequirementsUpload from './components/BRData';
import ResumeAnalysis from './components/ResumeAnalysis';
import AnalysisResults from './components/AnalysisResults';
import CandidateShortlisting from './components/CandidateData';
import { API_URL, AI_API_URL } from './utils/helpers';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2', contrastText: '#fff' },
    background: { default: '#f9fbfd', paper: '#ffffff' },
    grey: { 500: '#94a3b8' },
  },
  shape: { borderRadius: 12 },
  typography: { fontFamily: '"Inter", "Roboto", sans-serif' },
  app: { headerHeight: '64px' },
});

const SCREEN_TO_TAB_MAP = {
  jobUpload: 0,
  shortlist: 1,
  resume: 2,
  results: 2,
};

function App() {
  const [jobFiles, setJobFiles] = useState([]);
  const [jobRequirements, setJobRequirements] = useState([]);
  const [allCandidateData, setAllCandidateData] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [candidateFile, setCandidateFile] = useState(null);
  const [candidateFileName, setCandidateFileName] = useState(''); 
  const [requiredLanguages, setRequiredLanguages] = useState('');
  const [shortlistedCandidates, setShortlistedCandidates] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);
  const [rawSearchTerm, setRawSearchTerm] = useState('');
  const [filteredRawData, setFilteredRawData] = useState([]);
  const [selectedShortlistIds, setSelectedShortlistIds] = useState(new Set());
  const [currentScreen, setCurrentScreen] = useState('jobUpload');
  const [analysisResults, setAnalysisResults] = useState([]);
  const [showResumeResults, setShowResumeResults] = useState(false);
  const [selectedJobDetail, setSelectedJobDetail] = useState(null);

  const [selectedFiles, setSelectedFiles] = useState(() => {
    try {
      const saved = localStorage.getItem('resume_selectedFiles');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('resume_selectedFiles', JSON.stringify(selectedFiles));
  }, [selectedFiles]);

  // Combined fetch function for ALL required initial data
  const fetchInitialData = async () => {
    setIsDataLoading(true);
    try {
      // Fetch Candidates
      const [candidatesResponse, brResponse] = await Promise.all([
        fetch(`${API_URL}/api/employee`),
        fetch(`${API_URL}/api/brdata`)
      ]);

      if (!candidatesResponse.ok) throw new Error('Failed to fetch candidates');
      const candidateResult = await candidatesResponse.json();
      setAllCandidateData(candidateResult);
      setFilteredRawData(candidateResult);
      
      // *** NEW: Initialize selection to ALL candidates upon data load ***
      const initialIds = new Set(candidateResult.map(c => c.empNo).filter(empNo => empNo !== undefined));
      setSelectedShortlistIds(initialIds);


      if (!brResponse.ok) throw new Error('Failed to fetch job requirements');
      const brResult = await brResponse.json();
      
      const mappedData = brResult.map((r) => ({
        client: r.clientName,
        brId: r.autoReqId,
        grade: r.grade,
        skills: r.mandatorySkills,
        id: r.autoReqId,
        fileName: "Brdata.csv",
        status: r.currentReqStatus,
        resources: r.noOfPositions,
      }));
      setJobRequirements(mappedData);

    } catch (error) {
      console.error("Error fetching initial data:", error);
      toast.error(`Failed to load initial data: ${error.message}`);
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);
  // --- END OF CENTRALIZED FETCHING ---

  const navigateToScreen = (screenName) => {
    setCurrentScreen(screenName);
    if (screenName === 'resume') setShowResumeResults(false);
  };

  // MODIFIED: Ensure candidates are selected when navigating to the Shortlist tab
  const handleTabChange = (newTab) => {
    let screen;
    if (newTab === 0) {
      screen = 'jobUpload';
    } else if (newTab === 1) {
      screen = 'shortlist';
      
      // Auto-select all candidates when manually navigating to the Shortlist tab 
      // if we have data but no current selection (or the existing selection doesn't cover all data).
      if (allCandidateData.length > 0 && selectedShortlistIds.size !== allCandidateData.length) {
        const allIds = new Set(allCandidateData.map(c => c.empNo).filter(empNo => empNo !== undefined));
        setSelectedShortlistIds(allIds);
      }
      
    } else if (newTab === 2) {
      screen = analysisResults.length > 0 ? 'results' : 'resume';
    }
    navigateToScreen(screen);
  };

  const goToResumeUpload = () => {
    const finalShortlist = filteredRawData.filter(c => selectedShortlistIds.has(c.id));
    if (finalShortlist.length === 0) {
      toast.warn('Please select at least one candidate.');
      return;
    }
    // We already have the IDs set, but here we construct the data array based on the IDs
    setShortlistedCandidates(finalShortlist); 
    navigateToScreen('resume');
    toast.success(`Ready to analyze ${finalShortlist.length} resumes`);
  };

  const goToAnalysisResults = (results) => {
    setAnalysisResults(results);
    setShowResumeResults(true);
    navigateToScreen('results');
  };

  /**
   * Shortlist POST Call Integration (Remains Async)
   */
  const handleJobUploadAndTransition = async (skills, jobDetails) => {
    const safeSkills = typeof skills === 'string' ? skills : '';
    
    // 1. Set Job Details and Required Skills
    setRequiredLanguages(safeSkills);
    setSelectedJobDetail(jobDetails);
    
    try {
        setLoading(true); // Start loading indicator

        const formData = new FormData();
        formData.append("autoReqId", String(jobDetails.brId));
        
        // 2. Call the new API endpoint to create the shortlist
        const response = await fetch(`${AI_API_URL}/match-skills/`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to create candidate shortlist via API');
        }

      const data = await response.json();
      let matchingCandidates = data.results; // This is the object with 'results' key


      // 3. Update Shortlist State with API results
      const matchingIds = new Set(matchingCandidates.map(c => c.empNo )); // NOTE: Mapped `id` or `employeeName` for uniqueness.
        setShortlistedCandidates(matchingCandidates); 
        setSelectedShortlistIds(matchingIds); 
        
        // 4. Transition to the Analysis Screen (Step 1)
        navigateToScreen('resume'); 
        
        toast.success(
          `Job requirements loaded! API automatically selected ${matchingCandidates.length} matching candidates for analysis. BR ID: ${jobDetails.brId}, Client: ${jobDetails.client}, Grade: ${jobDetails.grade}`
        );
    } catch (error) {
        console.error("Error creating shortlist:", error);
        toast.error(`Failed to automatically create shortlist: ${error.message}`);
    } finally {
        setLoading(false); // Stop loading indicator
    }
};

  const { app } = theme;
  const brId = selectedJobDetail?.brId;

  if (isDataLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={48} />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <ToastContainer position="top-right" autoClose={3000} theme="light" />
        <Header />

        {/* Progress Steps */}
        <Box
          sx={{
            position: 'sticky',
            top: app.headerHeight,
            zIndex: 900,
            bgcolor: 'white',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          }}
        >
          <ProgressSteps
            activeTab={SCREEN_TO_TAB_MAP[currentScreen]}
            onTabChange={handleTabChange}
          />
        </Box>

        {/* Main Content */}
        <Box sx={{ flexGrow: 1, p: { xs: 1.5, sm: 2, md: 3 }, pb: 4 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              bgcolor: 'white',
              boxShadow: '0 6px 25px rgba(0,0,0,0.08)',
              minHeight: 'calc(100vh - 180px)',
            }}
          >
            {loading && <LinearProgress />}
            <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
              {currentScreen === 'results' || (currentScreen === 'resume' && showResumeResults) ? (
                <AnalysisResults
                  analysisResults={analysisResults}
                  brId={brId}
                  goToPreviousStep={() => navigateToScreen('resume')}
                />
              ) : currentScreen === 'resume' ? (
                <Box key="resume-analysis-stable" sx={{ width: '100%' }}>
                  <ResumeAnalysis
                    goToAnalysisResults={goToAnalysisResults}
                    goToShortlist={() => navigateToScreen('shortlist')}
                    // NOTE: shortlistedCandidates here refers to the final list committed for analysis
                    shortlistedData={shortlistedCandidates} 
                    requiredSkills={requiredLanguages}
                    brId={brId}
                    selectedJobDetail={selectedJobDetail}
                    selectedFiles={selectedFiles}
                    setSelectedFiles={setSelectedFiles}
                  />
                </Box>
              ) : currentScreen === 'jobUpload' ? (
                <JobRequirementsUpload
                  jobFiles={jobFiles}
                  setJobFiles={setJobFiles}
                  parsedData={jobRequirements}
                  setParsedData={setJobRequirements}
                  goToCandidateUpload={handleJobUploadAndTransition}
                  // Pass down the function to re-fetch BR data after a new upload
                  refetchJobRequirements={fetchInitialData} 
                />
              ) : (
                <CandidateShortlisting
                  goToJobUpload={() => navigateToScreen('jobUpload')}
                  goToResumeUpload={goToResumeUpload}
                 updateCandidateFile={setCandidateFile}
                  updateCandidateFileName={setCandidateFileName}
                  selectedJobDetail={selectedJobDetail}
                  requiredLanguages={requiredLanguages}
                  candidateFile={candidateFile}
                  candidateFileName={candidateFileName} 
                  filteredRawData={filteredRawData}
                  // Pass down the full data fetch function so CandidateData can trigger a refresh
                  refetchAllCandidates={fetchInitialData} 
                  rawSearchTerm={rawSearchTerm}
                  handleRawSearch={() => {}}
                  handleClearRawSearch={() => {}}
                  loading={loading}
                  isDataLoading={isDataLoading}
                  isFiltered={isFiltered}
                  // NOTE: shortlistedCandidates is not strictly needed here, filteredRawData is the source
                  // shortlistedCandidates={shortlistedCandidates} 
                  selectedShortlistIds={selectedShortlistIds}
                  toggleShortlistSelection={(id) => {
                    setSelectedShortlistIds(prev => {
                      const set = new Set(prev);
                      set.has(id) ? set.delete(id) : set.add(id);
                      return set;
                    });
                  }}
                />
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;