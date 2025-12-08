import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import FileUpload from './FileUpload.jsx'; 
import { API_URL } from '../utils/helpers'; 

import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Box, Typography, CircularProgress, Tooltip, 
} from '@mui/material';

// Define base styles (Copied/Adapted from JobRequirementsUpload.jsx for consistency)
const cellBaseSx = {
    py: 1.2,
    px: 1.2,
    wordBreak: 'break-word',
    fontSize: '1rem',
    minWidth: '80px' 
};

const tableContainerSx = {
    overflowX: "auto",
    borderRadius: "8px",
    mt: "16px",
    border: "1px solid #e3f2fd",
    maxHeight: '70vh', 
    overflowY: 'auto',
};


// --- Component for Two-Line Truncation and Tooltip ---
const SkillCellWithTooltip = ({ skillText }) => {
    const truncateStyle = {
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        wordBreak: 'break-word',
    };

    if (!skillText) return '';

    return (
        <Tooltip 
            title={skillText} 
            placement="bottom-start" 
        >
            <Box component="span" sx={truncateStyle}>
                {skillText}
            </Box>
        </Tooltip>
    );
};
// ------------------------------------------------------------------------


/**
 * Renders the interactive table for candidate shortlisting.
 */
const renderCandidateTable = (
    candidates, loading, 
    selectedShortlistIds, toggleShortlistSelection
) => {
    const rawData = Array.isArray(candidates) ? candidates : [];

    // MODIFIED: Removed the 'Select' column header
    const headers = [
        { label: 'Employee Name', w: '12%', align: 'left' },
        { label: 'Grade', w: '6%', align: 'center' },
        // { label: 'SBU', w: '10%', align: 'center' },
        { label: 'Skill Category', w: '15%', align: 'left' },
        { label: 'Top 3 Skills', w: '25%', align: 'left' },
        { label: 'Detailed Skill', w: '25%', align: 'center' },
        { label: 'Status', w: '6%', align: 'center' },
        { label: 'Release Date', w: '10%', align: 'center' },
    ];
    
    // Total columns = 8
    const colSpan = 8;

    return (
        <Box sx={{ mt: 0 }}>
            <TableContainer 
                component={Paper} 
                elevation={2} 
                sx={tableContainerSx}
            >
                <Table stickyHeader sx={{ minWidth: 1000 }}>
                    <TableHead>
                        <TableRow>
                            {headers.map(h => (
                                <TableCell 
                                    key={h.label} 
                                    align={h.align} 
                                    sx={{ 
                                        ...cellBaseSx, 
                                        width: h.w, 
                                        bgcolor: "#e3f2fd", 
                                        color: "#1976d2", 
                                        fontWeight: "bold", 
                                        textTransform: "uppercase" 
                                    }}
                                >
                                    {h.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={colSpan} sx={{ textAlign: 'center', py: 5 }}>
                                    <CircularProgress size={28} />
                                </TableCell>
                            </TableRow>
                        ) : rawData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={colSpan} sx={{ textAlign: 'center', py: 8, color: '#999' }}>
                                    {"Upload a candidate file to begin shortlisting"}
                                </TableCell>
                            </TableRow>
                        ) : (
                            rawData.map((c, i) => { 
                                const id = c.empNo;
                                if (!id) return null;
                                
                                // Check if this candidate is currently selected
                                const isSelected = selectedShortlistIds.has(id); 

                                return (
                                    <TableRow
                                        key={id}
                                        hover
                                        // The row click handler toggles selection
                                        onClick={() => toggleShortlistSelection(id)}
                                        sx={{
                                            bgcolor: i % 2 ? "#fdfdfe" : "#f8fbff",
                                            cursor: 'pointer',
                                            // Visual indicator for selection (Left Border)
                                            borderLeft: isSelected ? '4px solid #1976d2' : '4px solid transparent',
                                            '&:hover': { 
                                                bgcolor: '#e6f0ff',
                                                borderLeft: isSelected ? '4px solid #1976d2' : '4px solid #ccc',
                                            }
                                        }}
                                    >
                                        {/* REMOVED: Checkbox Cell */}
                                        
                                        {/* All remaining cells rely on the Row's onClick for action */}
                                        <TableCell sx={{...cellBaseSx, fontWeight: 500 }}>{c.empName || ''}</TableCell>
                                        <TableCell align="center" sx={cellBaseSx}>{c.grade || ''}</TableCell>
                                        <TableCell sx={cellBaseSx}>{c.skillsCategory || ''}</TableCell>
                                        <TableCell sx={cellBaseSx}>
                                            <SkillCellWithTooltip skillText={c.top3Skills} />
                                        </TableCell>
                                        <TableCell sx={cellBaseSx}>
                                            <SkillCellWithTooltip skillText={c.detailedSkills} />
                                        </TableCell>
                                        {/* <TableCell align="center" sx={cellBaseSx}>
                                            <Typography component="strong" fontWeight="bold">{c.totalExp || ''}</Typography>
                                        </TableCell> */}
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
                                                    bgcolor: c.status === 'Available' ? '#e8f5e8' : '#ffebee', 
                                                    color: c.status === 'Available' ? '#2e7d32' : '#c62828',
                                                }}
                                            >
                                                {c.status || ''}
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center" sx={cellBaseSx}>{c.lwd || ''}</TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};


const CandidateShortlisting = (props) => {
    const {
        updateCandidateFile, 
        updateCandidateFileName,
        candidateFileName, 
        rawSearchTerm, 
        loading: isAppLoading, 
        selectedShortlistIds,
        toggleShortlistSelection, 
        filteredRawData: rawCandidateData = [], 
        candidateFile, 
        refetchAllCandidates, 
    } = props;
    
    // Local state for filtering and upload loading
    const [filteredCandidates, setFilteredCandidates] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    
    // Handle the Candidate File Upload (POST call)
    const handleUploadCandidateData = async (file, fileName) => {
        setIsUploading(true);
        const fileToUse = fileName;

        try {

            const formData = new FormData();
            formData.append("file", file);
            formData.append("fileName", fileToUse);

            const response = await fetch(`${API_URL}/api/employee/upload`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to upload candidate data to server.');
            }

            const result = await response.json();
            
            // Refresh the candidate data in the parent component (App.js)
            await refetchAllCandidates(); 

            toast.success(result.message || `Candidate data from ${fileToUse} uploaded successfully!`);
            
        } catch (error) {
            console.error("Error during candidate upload:", error);
            toast.error(`Candidate file upload failed: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };


    // Filtering Logic
    useEffect(() => {
        if (!rawCandidateData || rawCandidateData.length === 0) {
            setFilteredCandidates([]);
            return;
        }

        const term = rawSearchTerm ? rawSearchTerm.toLowerCase().trim() : '';

        if (!term) {
            setFilteredCandidates(rawCandidateData);
            return;
        }

        const newFilteredCandidates = rawCandidateData.filter(candidate => {
            const preferredSkill = candidate.subSkill ? String(candidate.subSkill).toLowerCase() : '';
            return preferredSkill.includes(term);
        });

        setFilteredCandidates(newFilteredCandidates);

    }, [rawCandidateData, rawSearchTerm]);
    

    return (
        <Box sx={{ p: 4, maxWidth: '1700px', margin: '0 auto', bgcolor: '#fff' }}>

            <FileUpload 
              setCandidateFile={updateCandidateFile} 
              handleUpload={handleUploadCandidateData} 
              isUploading={isUploading}
              setCandidateFileName={updateCandidateFileName}
              fileNameProp={candidateFileName}
            />
            
            {/* Show table only if a file has been selected (i.e., candidateFile is set) */}
            {(isAppLoading || filteredCandidates.length > 0 || isUploading) ? (
                renderCandidateTable(
                    filteredCandidates, 
                    isAppLoading || isUploading, 
                    selectedShortlistIds, 
                    toggleShortlistSelection
                )
            ) : (
                // Only show this prompt if we are NOT loading and have NO data.
                // This covers the initial state where no data is present after load.
                <Box sx={{ textAlign: 'center', py: 10, color: '#999', mt: 4, border: '1px dashed #ccc', borderRadius: 2 }}>
                    <Typography variant="h6">No candidate data available. Please upload a file to begin shortlisting.</Typography>
                </Box>
            )}
        </Box>
    );
};

export default CandidateShortlisting;