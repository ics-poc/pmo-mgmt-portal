// JobRequirementsUpload.jsx
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { API_URL } from '../utils/helpers';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress, Chip, IconButton,
  Menu, MenuItem, Grid, // Grid is imported but not used directly in this file's main render
  // NEW IMPORTS for Stepper
  Stepper, Step, StepLabel 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
// IMPORT the new component
import ViewJobDetails from './ViewJobDetails'; 





const JobRequirementsUpload = ({ 
  jobFiles, 
  setJobFiles, 
  parsedData, 
  setParsedData, 
  goToCandidateUpload, 
  onFetchComplete // New prop to signal initial load completion
}) => {
  const [parsing, setParsing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // State for the action menu
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedRowForMenu, setSelectedRowForMenu] = useState(null);
  
  // State for the Job Details Modal
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [brDetails, setBrDetails] = useState(null); // Stores full details for the modal

  // Handlers for opening and closing the menu
  const handleMenuOpen = (event, row) => {
    event.stopPropagation(); 
    setMenuAnchorEl(event.currentTarget);
    setSelectedRowForMenu(row);
  };
  const handleMenuClose = (event) => {
    if (event) event.stopPropagation();
    setMenuAnchorEl(null);
    setSelectedRowForMenu(null); 
  };

  // MODIFIED: Handler to open the View Details Modal, now fetches data from API
const handleViewDetails = async (row) => {
    try {
        const response = await fetch(`${API_URL}/api/brdata/${row.brId}`);
        
        if (!response.ok) {
            // Log the error response status for debugging
            console.error(`Server responded with status: ${response.status}`);
            throw new Error('Failed to fetch job details');
        }

        // Attempt to parse JSON
        const details = await response.json();
        
        // Final check to ensure the returned JSON is not empty or null
        if (details && Object.keys(details).length > 0) {
            setBrDetails(details);
            setIsDetailsModalOpen(true);
        } else {
            // Handle case where server returns 200 OK but with an empty body
            toast.error(`Details for BR ID ${row.brId} not found or data is empty.`);
        }
    } catch (error) {
        console.error("Error fetching job details:", error);
        toast.error(`Failed to load details for BR ID ${row.brId}. Please check server.`);
    }
};

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setBrDetails(null);
  };

  // Define table cell base style 
  const cellBaseSx = {
    py: 1.2,
    px: 1.2,
    wordBreak: 'break-word',
    maxWidth: '150px',
    fontSize: '1rem'
  };
  
  // Fetch Job Requirements Logic (unchanged)
  const fetchJobRequirements = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/brdata`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();

      const mappedData = result.map((r) => ({
        client: r.clientName,
        brId: r.autoReqId,
        grade: r.grade,
        skills: r.mandatorySkills,
        id: r.autoReqId,
        status: r.currentReqStatus,
        resources: r.noOfPositions,
      }));

      setParsedData(mappedData);
    } catch (error) {
      console.error("Error fetching job requirements:", error);
      toast.error("Failed to load existing job requirements from the server.");
    } finally {
        if (onFetchComplete) {
            onFetchComplete(); 
        }
    }
  }, [setParsedData, onFetchComplete]);

  // useEffect hook to fetch data on component mount (unchanged)
  useEffect(() => {
    if (parsedData.length === 0) {
      fetchJobRequirements();
    }
  }, [fetchJobRequirements, parsedData.length]);


  const processFiles = (files) => {
    const valid = files.filter(f => /\.(xlsx|xls|csv)$/i.test(f.name));
    if (!valid.length) {
      toast.error("Please upload .XLSX, .XLS, or .CSV files only.");
      return;
    }

    const fileToUpload = valid[0];
    if (fileToUpload instanceof File) {
      console.log("Yes, this is a File object");
    } else {
      console.log("Not a File");
      console.log(typeof myVar);
    }
    setSelectedFile(fileToUpload);
    handleDirectUpload(fileToUpload);
  };
  
  const handleDirectUpload = (file) => {
    setParsing(true);

    const fileName = file.name;

    setTimeout(async () => {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("fileName", fileName);

        const response = await fetch(`${API_URL}/api/brdata/upload`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        await fetchJobRequirements(); 

        toast.success(result.message || `Successfully uploaded file: ${fileName}. New requirements loaded.`);

      } catch (error) {
        console.error("Error processing file upload:", error);
        toast.error("Failed to upload job requirements to the server.");
        setSelectedFile(null);
      } finally {
        setParsing(false);
      }
    }, 500);

  };

  const removeRow = async (id, brId) => { // ADDED brId parameter
    try {
        // 1. Call the new DELETE API endpoint
        const response = await fetch(`${API_URL}/job-requirements/${brId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            throw new Error(`Failed to delete BR ID ${brId} on server.`);
        }

        const result = await response.json();
        
        // 2. Update local state only if server deletion was successful
        setParsedData(prev => prev.filter(r => r.id !== id));
        handleMenuClose(); // Close the menu if open

        toast.success(result.message || `Successfully removed BR ID ${brId}.`);

    } catch (error) {
        console.error("Error removing job requirement:", error);
        toast.error(`Failed to remove BR ID ${brId}. Please check server.`);
    }
  };

  const handleUploadRow = (row) => {
    // This function will navigate the user and effectively move to step 1
    goToCandidateUpload(row.skills, row);
  }


  const getStatusStyle = (status) => {
    switch (status) {
      case "Open": return { bgcolor: '#e8f5e8', color: '#2e7d32' };
      case "Active": return { bgcolor: '#fff3e0', color: '#ef6c00' };
      case "In Review": return { bgcolor: '#e3f2fd', color: '#1976d2' };
      default: return { bgcolor: '#e2e3e5', color: '#383d41' };
    }
  };

  return (
    <Box sx={{ p: 4, pb: 0, maxWidth: '1800px', margin: '0 0 0 0', fontFamily: "'Segoe UI', sans-serif" }}>

      
      {/* Header Container (unchanged) */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: "16px" // Changed to string for consistency
      }} className="header-container">
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: "600",
              color: "#2c3e50",
              m: "0 0 4px"
            }}
          >
            Upload BR Data
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle2" sx={{ color: "#7f8c8d" }}>
              File Name:
            </Typography>
            <Typography
              variant="subtitle2"
              color={selectedFile ? "text.primary" : "text.secondary"}
              sx={{ fontWeight: selectedFile ? 600 : 400 }}
            >
              {selectedFile
                ? selectedFile.name
                : "No file selected"
              }
            </Typography>
          </Box>

        </Box>

        {/* Hidden File Input (unchanged) */}
        <input
          id="file-input"
          type="file"
          multiple={false}
          accept=".xlsx,.xls,.csv"
          onChange={e => {
            if (e.target.files.length > 0) {
              processFiles(Array.from(e.target.files));
            }
            e.target.value = null;
          }}
          style={{ display: "none" }}
        />

        {/* Upload File Button (unchanged) */}
        <Button
          component="label"
          htmlFor="file-input"
          variant="contained"
          startIcon={<CloudUploadIcon />}
          disabled={parsing}
          title="Choose and upload .XLSX, .XLS, or .CSV files"
          sx={{
            bgcolor: '#4da6ff',
            color: 'white',
            '&:hover': {
              bgcolor: '#1976d2',
            },
            fontWeight: '600',
            textTransform: 'uppercase',
            p: '8px 16px',
            borderRadius: '8px'
          }}
        >
          Upload File
        </Button>

      </Box>

      {/* Parsing Indicator (unchanged) */}
      {parsing && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', m: '20px 0', color: 'primary.main' }}>
          <CircularProgress size={20} sx={{ mb: 1 }} />
          <Typography variant="body2">Processing upload via API...</Typography>
        </Box>
      )}

      {/* Uploaded Files Section (unchanged) */}
      {jobFiles.length > 0 && (
        <Box sx={{ mt: 1.875, mb: '20px' }}>
          <Typography variant="h6" sx={{ fontWeight: "600", color: "#2c3e50", mb: 1.25 }}>
            Previously Loaded Files ({jobFiles.length})
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {jobFiles.map((f, i) => (
              <Chip
                key={i}
                label={f.name}
                deleteIcon={<CloseIcon />}
                sx={{
                  bgcolor: "#e3f2fd",
                  color: "#1976d2",
                  fontSize: "0.8rem",
                  fontWeight: "500"
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Table - Enforce scrollbar after 8 rows (unchanged) */}
      {parsedData.length > 0 && (
        <TableContainer
          component={Paper}
          sx={{
            overflowX: "auto",
            borderRadius: "8px",
            mt: "16px",
            border: "1px solid #e3f2fd",
            maxHeight: '850px',
            overflowY: 'auto'
          }}
        >
          <Table stickyHeader sx={{ minWidth: 1100 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ ...cellBaseSx, width: "12%", bgcolor: "#e3f2fd", color: "#1976d2", fontWeight: "bold", textTransform: "uppercase" }}>BR ID</TableCell>
                <TableCell sx={{ ...cellBaseSx, width: "15%", bgcolor: "#e3f2fd", color: "#1976d2", fontWeight: "bold", textTransform: "uppercase" }}>Client</TableCell>
                <TableCell sx={{ ...cellBaseSx, width: "12%", bgcolor: "#e3f2fd", color: "#1976d2", fontWeight: "bold", textTransform: "uppercase" }}>Grade</TableCell>
                <TableCell sx={{ ...cellBaseSx, width: "28%", bgcolor: "#e3f2fd", color: "#1976d2", fontWeight: "bold", textTransform: "uppercase" }}>Skills</TableCell>
                <TableCell align="center" sx={{ ...cellBaseSx, width: "11%", bgcolor: "#e3f2fd", color: "#1976d2", fontWeight: "bold", textTransform: "uppercase" }}>Openings</TableCell>
                <TableCell align="center" sx={{ ...cellBaseSx, width: "11%", bgcolor: "#e3f2fd", color: "#1976d2", fontWeight: "bold", textTransform: "uppercase" }}>Status</TableCell>
                <TableCell align="center" sx={{ ...cellBaseSx, width: "11%", bgcolor: "#e3f2fd", color: "#1976d2", fontWeight: "bold", textTransform: "uppercase" }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {parsedData.map((r, i) => (
                <TableRow
                  key={r.id}
                  hover
                  sx={{
                    bgcolor: i % 2 ? "#fdfdfe" : "#f8fbff",
                    '&:hover': { bgcolor: '#e6f0ff' }
                  }}
                >  <TableCell sx={cellBaseSx}>{r.brId}</TableCell>
                  <TableCell sx={cellBaseSx}>{r.client}</TableCell>
                 
                  <TableCell sx={cellBaseSx}>{r.grade}</TableCell>
                  <TableCell sx={cellBaseSx}>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                      {r.skills.split(",").map((skill, j) => (
                        <Chip
                          key={j}
                          label={skill.trim()}
                          size="small"
                          sx={{ bgcolor: "#bbdefb", color: "#1565c0", fontSize: "0.7rem", fontWeight: "500" }}
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell align="center" sx={cellBaseSx}>
                    <Typography component="strong" fontWeight="bold">{r.resources}</Typography>
                  </TableCell>
                  <TableCell align="center" sx={cellBaseSx}>
                    <Box
                      component="span"
                      sx={{
                        p: "3px 8px",
                        borderRadius: "10px",
                        fontSize: "0.7rem",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        display: "inline-block",
                        ...getStatusStyle(r.status)
                      }}
                    >
                      {r.status}
                    </Box>
                  </TableCell>
                  <TableCell align="center" sx={cellBaseSx}>
                    <IconButton
                      aria-label="more"
                      id={`action-button-${r.id}`}
                      aria-controls={Boolean(menuAnchorEl) ? 'action-menu' : undefined}
                      aria-expanded={Boolean(menuAnchorEl) ? 'true' : undefined}
                      aria-haspopup="true"
                      onClick={(event) => handleMenuOpen(event, r)}
                      title="More actions"
                    >
                      <MoreHorizIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

        </TableContainer>
      )}
      
      {/* ADDED: The Menu component itself with the new item */}
      <Menu
        id="action-menu"
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        MenuListProps={{
          'aria-labelledby': selectedRowForMenu ? `action-button-${selectedRowForMenu.id}` : undefined,
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {/* ADDED: View Details Menu Item */}
        <MenuItem
          onClick={(e) => {
            if (selectedRowForMenu) {
              handleViewDetails(selectedRowForMenu);
            }
            handleMenuClose(e);
          }}
          sx={{ color: 'primary.main' }}
        >
          <VisibilityIcon sx={{ mr: 1.5, fontSize: '1.2rem' }} />
          View Details
        </MenuItem>

        <MenuItem
          onClick={(e) => {
            if (selectedRowForMenu) {
              handleUploadRow(selectedRowForMenu);
              // When the user clicks this, they move to the next step (Shortlist Candidates)
            }
            handleMenuClose(e);
          }}
          sx={{ color: 'success.main' }}
        >
          <CloudUploadIcon sx={{ mr: 1.5, fontSize: '1.2rem' }} />
          Shortlist Candidates
        </MenuItem>
        
        <MenuItem
          onClick={(e) => {
            if (selectedRowForMenu) {
              // MODIFIED to pass both id and brId
              removeRow(selectedRowForMenu.id, selectedRowForMenu.brId); 
            }
            handleMenuClose(e);
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1.5, fontSize: '1.2rem' }} />
          Remove
        </MenuItem>
      </Menu>

      {/* 5. ADDED: Job Details Modal Render */}
      <ViewJobDetails
        open={isDetailsModalOpen}
        handleClose={handleCloseDetailsModal}
        details={brDetails}
      />
    </Box>
  );
};

export default JobRequirementsUpload;