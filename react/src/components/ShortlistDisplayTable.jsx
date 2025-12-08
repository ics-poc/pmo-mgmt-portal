import React from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Box, Typography, CircularProgress, Tooltip, Chip, Checkbox
} from '@mui/material';

// --- NEW REUSABLE COMPONENT FOR TRUNCATED TEXT WITH TOOLTIP ---
const TruncatedTextWithTooltip = ({ text }) => {
    // Defines the style for truncating text to two lines
    const truncateStyle = {
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        wordBreak: 'break-word',
        maxHeight: '3em', // Approximate 2 lines height
        lineHeight: '1.5em',
        fontSize: '0.9rem'
    };

    if (!text) return <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.9rem' }}>N/A</Typography>;

    return (
        // Tooltip shows the full text on hover
        <Tooltip title={text} placement="bottom-start" enterDelay={500}>
            {/* Typography component applies the truncation style */}
            <Typography component="div" variant="body2" sx={{ ...truncateStyle, cursor: 'default' }}>
                {text}
            </Typography>
        </Tooltip>
    );
};
// -------------------------------------------------------------

// Reusable component to display skills as chips
const SkillChipDisplay = ({ skillsString, chipColor = "#bbdefb", textColor = "#1565c0" }) => {
    if (!skillsString) return <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.9rem' }}>N/A</Typography>;

    // Split and map skills to Chip components
    const skillsArray = skillsString.split(',').map(s => s.trim()).filter(s => s.length > 0);
    
    // Truncate the full skill string after two lines for the table cell view
    const truncateStyle = {
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        wordBreak: 'break-word',
    };

    const FullSkillsContent = (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: "4px", ...truncateStyle }}>
            {skillsArray.map((skill, j) => (
                <Chip
                    key={j}
                    label={skill}
                    size="small"
                    sx={{ 
                        bgcolor: chipColor, 
                        color: textColor, 
                        fontSize: "0.7rem", 
                        fontWeight: "500",
                        height: '22px' // Standard chip height
                    }}
                />
            ))}
        </Box>
    );

    return (
        // Use Tooltip to show all skills on hover
        <Tooltip title={skillsString} placement="bottom-start" enterDelay={500}>
            <Box component="div" sx={{ width: '100%', cursor: 'default' }}>
                {FullSkillsContent}
            </Box>
        </Tooltip>
    );
};

const cellBaseSx = {
    py: 1.2,
    px: 1.2,
    wordBreak: 'break-word',
    fontSize: '1rem',
};

const ShortlistDisplayTable = ({
    candidates = [],
    isDataLoading = false,
    title = "Candidates Selected for Analysis", // Updated default title
    onSelectionChange = () => {}, 
    // This prop holds the actual selected state and must control the Checkbox
    selectedCandidateIds = new Set(), 
}) => {
    
    // Handler for individual checkbox click
    const handleCheckboxClick = (candidateId) => {
        const newSelectedIds = new Set(selectedCandidateIds);

        if (newSelectedIds.has(candidateId)) {
            newSelectedIds.delete(candidateId);
        } else {
            newSelectedIds.add(candidateId);
        }

        // Notify the parent component (ResumeAnalysis) of the change
        onSelectionChange(Array.from(newSelectedIds));
    };

    // Handler for "select all" checkbox click
    const handleSelectAllClick = (event) => {
        // Use employeeName as the unique ID for the new data structure
        const candidateIds = candidates.map(c => c.employeeName).filter(id => id);
        
        if (event.target.checked) {
            onSelectionChange(candidateIds);
        } else {
            onSelectionChange([]);
        }
    };
    
    // CRITICAL FIX: Use employeeName as ID for length and selection checks
    const candidateIds = candidates.map(c => c.employeeName).filter(id => id);
    const isAllSelected = candidateIds.length > 0 && selectedCandidateIds.size === candidateIds.length;
    const isIndeterminate = selectedCandidateIds.size > 0 && selectedCandidateIds.size < candidateIds.length;


    // CRITICAL FIX: Update headers to match the fields available in the new data structure
    // 1. ADDED 'Skill Match %' column
    // 2. RENAMED 'Match %' to 'Overall Match %' for clarity
    const headers = [
        { label: 'Select', w: "7%", align: 'center' }, 
        { label: 'Name', w: "13%", align: 'left' },
        { label: 'Grade', w: "8%", align: 'center' },
        { label: 'Skill Bucket', w: "22%", align: 'left' }, 
        { label: 'Top 3 Skills', w: "17%", align: 'left' }, 
        { label: 'Detailed Skills / Exp', w: "24%", align: 'left' }, 
        { label: 'Match %', w: "10%", align: 'center' }, // New last column
    ];

    return (
        <Box sx={{ mt: 3, maxWidth: '100%', overflowX: 'auto' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50', mb: 2 }}>
                {title} ({candidates.length})
            </Typography>

            <TableContainer 
                component={Paper} 
                elevation={1} 
                sx={{ 
                    borderRadius: 2, 
                    border: "1px solid #e3f2fd",
                    maxHeight: '70vh', 
                    overflowY: 'auto'
                }}
            >
                <Table stickyHeader sx={{ minWidth: 1200 }}> 
                    <TableHead>
                        <TableRow>
                            {headers.map(h => (
                                <TableCell 
                                    key={h.label} 
                                    align={h.align} 
                                    sx={{ 
                                        ...cellBaseSx, 
                                        fontWeight: 'bold', 
                                        color: '#1976d2', 
                                        width: h.w,  
                                        bgcolor: '#e3f2fd', 
                                        textTransform: 'uppercase' 
                                    }}
                                >
                                    {h.label}  {/* Simply display the label text for all headers */}

                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isDataLoading ? (
                            <TableRow>
                                <TableCell colSpan={headers.length} sx={{ textAlign: 'center', py: 5 }}> 
                                    <CircularProgress size={28} />
                                    <Typography variant="body2" sx={{ mt: 1 }}>Loading candidate data...</Typography>
                                </TableCell>
                            </TableRow>
                        ) : candidates.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={headers.length} sx={{ textAlign: 'center', py: 8, color: '#999' }}> 
                                    No candidates currently selected for analysis.
                                </TableCell>
                            </TableRow>
                        ) : (
                            candidates.map((c, i) => {
                                // Use employeeName as the unique ID for the new data structure
                                const id = c.employeeName; 
                                if (!id) return null;
                                
                                const isChecked = selectedCandidateIds.has(id); 

                                // MODIFICATION: Removed the skillMatchObj and skillMatchText logic as it's no longer displayed.
                                // The remaining logic is now streamlined.

                                return (
                                    <TableRow
                                        key={id}
                                        hover
                                        sx={{
                                            bgcolor: i % 2 ? "#fdfdfe" : "#f8fbff",
                                            '&:hover': { bgcolor: '#e6f0ff' },
                                            // Highlight selected rows
                                            ...(isChecked && { borderLeft: '4px solid #1976d2' }) 
                                        }}
                                    >
                                        {/* Select Checkbox Column */}
                                        <TableCell align="center" sx={cellBaseSx}>
                                            <Checkbox
                                                color="primary"
                                                checked={isChecked}
                                                onChange={() => handleCheckboxClick(id)}
                                            />
                                        </TableCell>

                                        {/* Name Column (employeeName) */}
                                        <TableCell sx={{ ...cellBaseSx, fontWeight: 500 }}>{c.employeeName || 'N/A'}</TableCell>
                                        
                                        {/* Grade Column */}
                                        <TableCell align="center" sx={cellBaseSx}>{c.grade || 'N/A'}</TableCell>
                                        
                                        {/* Skill Bucket Column */}
                                        <TableCell sx={cellBaseSx}>   
                                            <TruncatedTextWithTooltip text={c.skillBucket} />                                      
                                        </TableCell>
                                        
                                        {/* Top 3 Skills Column */}
                                        <TableCell sx={cellBaseSx}>
                                            <SkillChipDisplay 
                                                skillsString={c.top3Skills} 
                                                chipColor='#e8f0f8ff' 
                                                textColor='#1565c0' 
                                            />
                                        </TableCell>

                                        {/* Detailed Skills / Exp Column */}
                                        <TableCell sx={cellBaseSx}>
                                            <TruncatedTextWithTooltip text={c.detailedSkills} />
                                        </TableCell>
                                        
                                        {/* Match % Column (Now the last column, displaying c['match%']) */}
                                        <TableCell align="center" sx={cellBaseSx}>
                                            <Box
                                                sx={{
                                                    px: 2, py: 0.5, borderRadius: 1,
                                                    bgcolor: '#bbdefb',
                                                    color: '#1565c0',
                                                    fontSize: '0.9rem', fontWeight: 600,
                                                    //display: 'inline-block',
                                                    //minWidth: '70px'
                                                }}
                                            >
                                                {c['match%'] !== undefined ? `${c['match%'].toFixed(2)}%` : 'N/A'}
                                            </Box>
                                        </TableCell>
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

export default ShortlistDisplayTable;