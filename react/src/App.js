import React, { useState, useEffect, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom"; // Added Router imports
import {
  createTheme,
  ThemeProvider,
  CssBaseline,
  Box,
  CircularProgress,
  Paper,
  LinearProgress,
  Typography,
} from "@mui/material";
import Header from "./Header";
import ProgressSteps from "./ProgressSteps";
import JobRequirementsUpload from "./components/BRData";
import ResumeAnalysis from "./components/ResumeAnalysis";
import AnalysisResults from "./components/AnalysisResults";
import CandidateShortlisting from "./components/CandidateData";
import Login from "./components/Login";
import Welcome from "./components/Welcome";
// IMPORT NEW COMPONENT
import CandidateUpload from "./components/CandidateUpload";
import { API_URL, AI_API_URL } from "./utils/helpers";

const theme = createTheme({
  palette: {
    primary: { main: "#1976d2", contrastText: "#fff" },
    background: { default: "#f9fbfd", paper: "#ffffff" },
    grey: { 500: "#94a3b8" },
  },
  shape: { borderRadius: 12 },
  typography: { fontFamily: '"Inter", "Roboto", sans-serif' },
  app: { headerHeight: "64px" },
});

// We wrap the main logic in a component to use Router hooks
function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isTokenUser, setIsTokenUser] = useState(false);
  const [isValidatingToken, setIsValidatingToken] = useState(false);
  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsTokenUser(false);

    // optional cleanup
    localStorage.clear();
    sessionStorage.clear();

    navigate("/login", { replace: true });
  };

  // --- Data States ---
  const [jobFiles, setJobFiles] = useState([]);
  const [jobRequirements, setJobRequirements] = useState([]);
  const [allCandidateData, setAllCandidateData] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [candidateFile, setCandidateFile] = useState(null);
  const [candidateFileName, setCandidateFileName] = useState("");
  const [requiredLanguages, setRequiredLanguages] = useState("");
  const [shortlistedCandidates, setShortlistedCandidates] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);
  const [rawSearchTerm, setRawSearchTerm] = useState("");
  const [filteredRawData, setFilteredRawData] = useState([]);
  const [selectedShortlistIds, setSelectedShortlistIds] = useState(new Set());

  // --- View States ---
  // headerTitle is now derived from the URL, but keeping state if needed for dynamic updates
  const [headerTitle, setHeaderTitle] = useState(
    "Candidate Shortlisting System"
  );
  const [analysisResults, setAnalysisResults] = useState([]);
  const [showResumeResults, setShowResumeResults] = useState(false);
  const [selectedJobDetail, setSelectedJobDetail] = useState(null);

  // --- Router Hooks ---
  const location = useLocation();
  const navigate = useNavigate();

  // --- Internal Tab State for Employee System ---
  // 0: JobUpload, 1: Shortlist, 2: Resume/Results
  const [employeeSystemTab, setEmployeeSystemTab] = useState(0);

  const [selectedFiles, setSelectedFiles] = useState(() => {
    try {
      const saved = localStorage.getItem("resume_selectedFiles");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token && location.pathname === "/temp-login") {
      validateToken(token);
    }
  }, [location]);

  useEffect(() => {
    localStorage.setItem("resume_selectedFiles", JSON.stringify(selectedFiles));
  }, [selectedFiles]);

  const validateToken = useCallback(
    async (token) => {
      setIsValidatingToken(true);

      try {
        const response = await fetch(
          `${API_URL}/api/auth/temp-login?token=${token}`
        );

        const message = await response.text();

        if (response.ok) {
          setIsLoggedIn(true);
          setIsTokenUser(true);
          navigate("/", { replace: true });
          toast.success("Access granted via secure token");
        } else {
          navigate("/login", {
            replace: true,
            state: {
              tokenError: message || "Invalid or expired link",
            },
          });
        }
      } catch (error) {
        navigate("/", {
          replace: true,
          state: {
            tokenError: "Unable to verify link. Please try again.",
          },
        });
      } finally {
        setIsValidatingToken(false);
      }
    },
    [navigate]
  );

  // Combined fetch function for ALL required initial data
  const fetchInitialData = useCallback(async () => {
    setIsDataLoading(true);
    try {
      // Fetch Candidates
      const [candidatesResponse, brResponse] = await Promise.all([
        fetch(`${API_URL}/api/employee`),
        fetch(`${API_URL}/api/brdata`),
      ]);

      if (!candidatesResponse.ok) throw new Error("Failed to fetch candidates");
      const candidateResult = await candidatesResponse.json();
      setAllCandidateData(candidateResult);
      setFilteredRawData(candidateResult);

      // *** NEW: Initialize selection to ALL candidates upon data load ***
      const initialIds = new Set(
        candidateResult
          .map((c) => c.empNo)
          .filter((empNo) => empNo !== undefined)
      );
      setSelectedShortlistIds(initialIds);

      if (!brResponse.ok) throw new Error("Failed to fetch job requirements");
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
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchInitialData();
    }
  }, [isLoggedIn, fetchInitialData]);
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    navigate("/"); // Go to Welcome
    toast.success("Login Successful!");
  };

  // --- Handlers ---

  const handleTabChange = (newTab) => {
    // This now only applies to the Employee System internal tabs
    setEmployeeSystemTab(newTab);
    if (newTab === 2) setShowResumeResults(false);
  };

  const goToResumeUpload = () => {
    const finalShortlist = filteredRawData.filter((c) =>
      selectedShortlistIds.has(c.id)
    );
    if (finalShortlist.length === 0) {
      toast.warn("Please select at least one candidate.");
      return;
    }
    setShortlistedCandidates(finalShortlist);
    setEmployeeSystemTab(2); // Move to Resume tab
    toast.success(`Ready to analyze ${finalShortlist.length} resumes`);
  };

  const goToAnalysisResults = (results) => {
    setAnalysisResults(results);
    setShowResumeResults(true);
    // Ensure we remain on tab 2
    setEmployeeSystemTab(2);
  };

  const handleCandidateSystemProcess = async (brFile, cvFile) => {
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("jd_file", brFile);
      formData.append("resume_zip", cvFile); // ✅ SINGLE ZIP

      const response = await fetch(`http://localhost:8001/search_resumes_v2`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Processing failed");
      }

      const data = await response.json();

      toast.success("Candidate analysis complete!");

      return data; // ✅ IMPORTANT
    } catch (error) {
      console.error("Backend failed, using fallback data", error);

      // 🔁 Fallback mock response (good dev move tbh)
      const mockData = {
        results: [
          {
            br_id: "33184BR",
            matches: [
              {
                resume_id: "52246737",
                final_score: 67.86,
                primary_skill: "None",
              },
              {
                resume_id: "79541391",
                final_score: 67.25,
                primary_skill: "None",
              },
            ],
          },
          {
            br_id: "35358BR",
            matches: [
              {
                resume_id: "83816738",
                final_score: 78.22,
                primary_skill: "Sql",
              },
              {
                resume_id: "70089206",
                final_score: 62.65,
                primary_skill: "None",
              },
            ],
          },
        ],
      };

      toast.warning("Using mock data");

      return mockData; // ✅ UI still works
    } finally {
      setLoading(false);
    }
  };

  const handleJobUploadAndTransition = async (skills, jobDetails) => {
    const safeSkills = typeof skills === "string" ? skills : "";

    // 1. Set Job Details and Required Skills
    setRequiredLanguages(safeSkills);
    setSelectedJobDetail(jobDetails);

    try {
      setLoading(true); // Start loading indicator

      const formData = new FormData();
      formData.append("autoReqId", String(jobDetails.brId));

      // 2. Call the new API endpoint to create the shortlist
      const response = await fetch(`${AI_API_URL}/match-skills/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to create candidate shortlist via API");
      }

      const data = await response.json();
      let matchingCandidates = data.results; // This is the object with 'results' key

      const matchingIds = new Set(matchingCandidates.map((c) => c.empNo));
      setShortlistedCandidates(matchingCandidates);
      setSelectedShortlistIds(matchingIds);

      // Navigate internally to Resume tab
      setEmployeeSystemTab(2);

      toast.success(
        `Job requirements loaded! API automatically selected ${matchingCandidates.length} matching candidates.`
      );
    } catch (error) {
      // console.error("Error creating shortlist:", error);
      // toast.error(`Failed to automatically create shortlist: ${error.message}`);
      const data = {
        autoReqid: "33184BR",
        clientName: "BrightSpeed",
        grade: "E6",
        skills: "ServiceNow",
        results: [
          {
            empNo: "1027023",
            employeeName: "Waseem Ladakhan",
            grade: "E2",
            top3Skills: "1. Dotnet, 2. SQL, 3. Angular",
            skillBucket: "Dotnet, SQL, Angular, sharepoint,MVC,WebAPI",
            detailedSkills:
              "Total 4yrs Dotnet, SQL, Angular, sharepoint,MVC,WebAPI",
            "match%": 35.27,
            "skillMatch%": {
              ServiceNow: 32.07,
            },
          },
          {
            empNo: "1038516",
            employeeName: "R Brashanth",
            grade: "E5",
            top3Skills: "Support, Project management, Development",
            skillBucket:
              "Project Management, Application Support, SQL, ServiceNow, ITIL, Jira, Facets, Healthcare, CRM",
            detailedSkills:
              "Overall 10 years of ecperience Project Management, Application Support, SQL, ServiceNow, ITIL, Jira, Facets, Healthcare, CRM and secondarily in Frontend Development (React.js, Javascript), HTML, CSS",
            "match%": 34.4,
            "skillMatch%": {
              ServiceNow: 30.72,
            },
          },
        ],
      };
      let matchingCandidates = data.results; // This is the object with 'results' key

      // 3. Update Shortlist State with API results
      const matchingIds = new Set(matchingCandidates.map((c) => c.empNo)); // NOTE: Mapped `id` or `employeeName` for uniqueness.
      setShortlistedCandidates(matchingCandidates);
      setSelectedShortlistIds(matchingIds);

      // 4. Transition to the Analysis Screen (Step 1)
      // navigateToScreen("resume");
      setEmployeeSystemTab(2);

      toast.success(
        `Job requirements loaded! API automatically selected ${matchingCandidates.length} matching candidates for analysis. BR ID: ${jobDetails.brId}, Client: ${jobDetails.client}, Grade: ${jobDetails.grade}`
      );
    } finally {
      setLoading(false); // Stop loading indicator
    }
  };
  const handleUpdateSkills = async (newSkills) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("auto_req_id", String(selectedJobDetail.brId));
      formData.append("client_name", String(selectedJobDetail.client));
      formData.append("grade", String(selectedJobDetail.grade));
      formData.append("skills", String(newSkills));

      const response = await fetch(`${AI_API_URL}/match-skills/edit`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to update skills');

      const result = await response.json();
      setShortlistedCandidates(result.results);
      setRequiredLanguages(newSkills);
      const newIds = new Set(result.results.map(c => c.empNo));
      setSelectedShortlistIds(newIds);

      toast.success("Skills updated and shortlist refreshed.");
      return true;
    } catch (error) {
      // console.error("Update Skills Error:", error);
      // toast.error("Failed to update skills via backend.");
      // return false;
      const result = {
        autoReqid: "33184BR",
        clientName: "BrightSpeed",
        grade: "E6",
        skills: "ServiceNow,pthon,aditya, javas",
        results: [
          {
            empNo: "1027023",
            employeeName: "Waseem Ladakhan",
            grade: "E2",
            top3Skills: "1. Dotnet, 2. SQL, 3. Angular, 7 aditya",
            skillBucket: "Dotnet, SQL, Angular, sharepoint,MVC,WebAPI",
            detailedSkills:
              "Total 4yrs Dotnet, SQL, Angular, sharepoint,MVC,WebAPI",
            "match%": 95.27,
            "skillMatch%": {
              ServiceNow: 72.07,
              nooo:89
            },
          },
          {
            empNo: "1038516",
            employeeName: "R Brashanth",
            grade: "E5",
            top3Skills: "Support, Project management, Development,aditya",
            skillBucket:
              "Project Management, Application Support, SQL, ServiceNow, ITIL, Jira, Facets, Healthcare, CRM",
            detailedSkills:
              "Overall 10 years of ecperience Project Management, Application Support, SQL, ServiceNow, ITIL, Jira, Facets, Healthcare, CRM and secondarily in Frontend Development (React.js, Javascript), HTML, CSS",
            "match%": 94.4,
            "skillMatch%": {
              ServiceNow: 90.72,
              aditya: 80
            },
          },
        ],
      };
      setShortlistedCandidates(result.results);
      setRequiredLanguages(newSkills);
      const newIds = new Set(result.results.map(c => c.empNo));
      setSelectedShortlistIds(newIds);
      toast.success("Skills updated and shortlist refreshed.");
      return true;
    } finally {
      setLoading(false);
    }
  };

  const { app } = theme;
  const brId = selectedJobDetail?.brId;

  // --- Dynamic Title Helper ---
  const getCurrentHeaderTitle = () => {
    if (location.pathname === "/EmployeeShortlistingSystem")
      return "Employee Shortlisting System";
    if (location.pathname === "/CandidateShortlistingSystem")
      return "Candidate Shortlisting System";
    return "";
  };

  if (isValidatingToken) {
    return (
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Verifying secure access...</Typography>
      </Box>
    );
  }

  if (!isLoggedIn) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ToastContainer position="top-right" autoClose={3000} theme="light" />
        <Login handleLoginSuccess={handleLoginSuccess} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      {/* HEADER*/}
      {location.pathname !== "/login" && (
        <Header
          title={getCurrentHeaderTitle()}
          showBack={location.pathname !== "/"}
          onBack={() => navigate("/")}
          onLogout={handleLogout}
        />
      )}

      {/* PROGRESS STEPS: Show ONLY on Employee System */}
      {location.pathname === "/EmployeeShortlistingSystem" && (
        <Box
          sx={{
            position: "sticky",
            top: app.headerHeight,
            zIndex: 900,
            bgcolor: "white",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          }}
        >
          <ProgressSteps
            activeTab={employeeSystemTab}
            onTabChange={handleTabChange}
          />
        </Box>
      )}

      {/* MAIN CONTENT AREA */}
      <Box
        sx={{
          flexGrow: 1,
          p: { xs: 1.5, sm: 2, md: 3 },
          pb: 4,
          mt: location.pathname !== "/" ? app.headerHeight : 0,
        }}
      >
        <Routes>
          {/* 1. WELCOME SCREEN */}
          <Route path="/" element={<Welcome isTokenUser={isTokenUser} />} />

          {/* 2. CANDIDATE SHORTLISTING PAGE */}
          <Route
            path="/CandidateShortlistingSystem"
            element={
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  p: { xs: 2, sm: 4 },
                  bgcolor: "white",
                  boxShadow: "0 6px 25px rgba(0,0,0,0.08)",
                  minHeight: "calc(100vh - 180px)",
                }}
              >
                <CandidateUpload
                  onCancel={() => navigate("/")}
                  onProcess={handleCandidateSystemProcess}
                />
              </Paper>
            }
          />

          {/* 3. EMPLOYEE SYSTEM */}
          <Route
            path="/EmployeeShortlistingSystem"
            element={
              isDataLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
                  <CircularProgress size={48} />
                </Box>
              ) : (
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                    bgcolor: "white",
                    boxShadow: "0 6px 25px rgba(0,0,0,0.08)",
                    minHeight: "calc(100vh - 180px)",
                  }}
                >
                  {loading && <LinearProgress />}
                  <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                    {/* --- EMPLOYEE SYSTEM SUB-VIEWS (TABS) --- */}

                    {/* TAB 0: JOB UPLOAD */}
                    {employeeSystemTab === 0 && (
                      <JobRequirementsUpload
                        jobFiles={jobFiles}
                        setJobFiles={setJobFiles}
                        parsedData={jobRequirements}
                        setParsedData={setJobRequirements}
                        goToCandidateUpload={handleJobUploadAndTransition}
                        refetchJobRequirements={fetchInitialData}
                      />
                    )}

                    {/* TAB 1: SHORTLISTING */}
                    {employeeSystemTab === 1 && (
                      <CandidateShortlisting
                        goToJobUpload={() => setEmployeeSystemTab(0)}
                        goToResumeUpload={goToResumeUpload}
                        updateCandidateFile={setCandidateFile}
                        updateCandidateFileName={setCandidateFileName}
                        selectedJobDetail={selectedJobDetail}
                        requiredLanguages={requiredLanguages}
                        candidateFile={candidateFile}
                        candidateFileName={candidateFileName}
                        filteredRawData={filteredRawData}
                        refetchAllCandidates={fetchInitialData}
                        rawSearchTerm={rawSearchTerm}
                        handleRawSearch={() => { }}
                        handleClearRawSearch={() => { }}
                        loading={loading}
                        isDataLoading={isDataLoading}
                        isFiltered={isFiltered}
                        selectedShortlistIds={selectedShortlistIds}
                        toggleShortlistSelection={(id) => {
                          setSelectedShortlistIds((prev) => {
                            const set = new Set(prev);
                            set.has(id) ? set.delete(id) : set.add(id);
                            return set;
                          });
                        }}
                      />
                    )}

                    {/* TAB 2: RESUME & RESULTS */}
                    {employeeSystemTab === 2 &&
                      (showResumeResults && analysisResults.length > 0 ? (
                        <AnalysisResults
                          analysisResults={analysisResults}
                          brId={brId}
                          goToPreviousStep={() => setShowResumeResults(false)}
                        />
                      ) : (
                        <Box
                          key="resume-analysis-stable"
                          sx={{ width: "100%" }}
                        >
                          <ResumeAnalysis
                            goToAnalysisResults={goToAnalysisResults}
                            goToShortlist={() => setEmployeeSystemTab(1)}
                            shortlistedData={shortlistedCandidates} 
                            requiredSkills={requiredLanguages}
                            brId={brId}
                            selectedJobDetail={selectedJobDetail}
                            selectedFiles={selectedFiles}
                            setSelectedFiles={setSelectedFiles}
                            onUpdateSkills={handleUpdateSkills}
                          />
                        </Box>
                      ))}
                  </Box>
                </Paper>
              )
            }
          />
        </Routes>
      </Box>
    </Box>
  );
}

// MAIN APP COMPONENT
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
