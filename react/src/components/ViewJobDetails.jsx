import {
  Box, Typography, IconButton, Dialog, DialogTitle, DialogContent, Grid, TextField
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// This component is now purely for display and is read-only.
const ViewJobDetails = ({ open, handleClose, details }) => {

  // Robustly handle the 'details' prop, ensuring we get the single job object.
  const jobDetails = Array.isArray(details) && details.length > 0 ? details[0] : details;

  if (!jobDetails) return null;

  // Custom Styles for consistent TextField appearance
  const textFieldStyles = {
    width: '100%', 
    '& .MuiInputLabel-root': {
      fontWeight: 600,
      color: '#0d47a1',
      textTransform: 'uppercase',
      fontSize: '0.75rem' 
    },
    '& .MuiOutlinedInput-root': {
      height: '48px', 
      backgroundColor: '#f1f1f1', // Light gray background for read-only
      borderRadius: 1, 
      '& fieldset': {
        borderColor: '#dcdcdc',
        borderWidth: '1px',
      },
      // Ensure focus state does not look editable
      '&.Mui-focused fieldset': {
        borderColor: '#dcdcdc', 
        borderWidth: '1px',
      },
      '& .MuiInputBase-input': {
        fontWeight: 400,
        color: '#424242',
        padding: '12px 14px', 
        fontSize: '0.9rem' 
      }
    },
  };

  // Helper function to render a read-only, uniform text field in a Grid item
  const renderDetailItemContent = (label, value, isMultiline = false, gridXs = 3, rows = 3) => {
  const displayValue = value === null || value === undefined ? 'N/A' : String(value);


    return (
     <Grid item xs={gridXs} key={label}>
      <TextField
        label={label}
        value={displayValue}
        variant="outlined"
        fullWidth
        // Ensure multiline is correctly passed to the TextField component
        multiline={isMultiline} 
        minRows={isMultiline ? rows : 1}
        InputProps={{
          readOnly: true,
        }}
        sx={{
          ...textFieldStyles,
          '& .MuiOutlinedInput-root': {
            ...textFieldStyles['& .MuiOutlinedInput-root'],
            // Explicitly set height based on multiline status
            height: isMultiline ? 'auto' : '48px', 
          },
        }}
      />
    </Grid>
    );
  };
  
  // --- Data Mapping and Structure ---

  // Structured to ensure 4 items per row (xs=3 each) for consistency, 
  // and the final Job Description spans the full row (xs=12) with single line height.
  const allFields = [
    // Row 1 (4 items, xs=3 each)
    { label: "Designation", value: jobDetails.designation, gridXs: 3 },
    { label: "Grade", value: jobDetails.grade, gridXs: 3 },
    { label: "Client Name", value: jobDetails.clientName, gridXs: 3 },
    { label: "Project", value: jobDetails.project, gridXs: 3 },

    // Row 2 (4 items, xs=3 each)
    { label: "Billing Type", value: jobDetails.billingType, gridXs: 3 },
    { label: "No. of Openings", value: jobDetails.noOfPositions, gridXs: 3 },
    { label: "Sourcing Type", value: jobDetails.sourcingType, gridXs: 3 },
    { label: "Requirement Type", value: jobDetails.requirementType, gridXs: 3 },

    // Row 3 (4 items, xs=3 each)
    { label: "Joining Location", value: jobDetails.joiningLocation, gridXs: 3 },
    { label: "Date Approved", value: jobDetails.dateApproved, gridXs: 3 },
    { label: "Current Status", value: jobDetails.currentReqStatus, gridXs: 3 },
    { label: "Entity", value: jobDetails.entity, gridXs: 3 },

    // Row 4 (4 items, xs=3 each)
    { label: "Client Interview", value: jobDetails.clientInterview, gridXs: 3 },
    { label: "RM Name", value: jobDetails.rmName, gridXs: 3 },
    { label: "Requester ID", value: jobDetails.requesterId, gridXs: 3 },
    { label: "Mandatory Skills", value: jobDetails.mandatorySkills, gridXs: 3},
    
    // Row 5: Job Description (Occupies the entire row, xs=12)
    { 
      label: "Job Description", 
      value: jobDetails.jobDescription, 
      gridXs: 12, // Set to 12 for full row width
      multiline: false, // CRITICAL FIX: Set to false to keep it single line height (48px)
      rows: 1 // Ensure minimum row count is 1
    }
  ];


  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth={false}
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 3,
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          border: '1px solid #e3f2fd',
          width: '850px', 
          maxWidth: '95vw'
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 2,
          background: '#2196f3',
          color: 'white',
          borderRadius: '12px 12px 0 0',
          borderBottom: '4px solid #1e88e5',
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            Job Requirement Overview
          </Typography>
          <Typography variant="subtitle2" sx={{ opacity: 0.9, fontWeight: 400 }}>
            BR ID: <strong style={{ fontWeight: 700 }}>{jobDetails.autoReqId || 'N/A'}</strong>
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          sx={{
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.2)',
              transform: 'scale(1.1)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent
        dividers
        sx={{
          p: 3,
          backgroundColor: '#ffffff',
          '&.MuiDialogContent-dividers': {
            borderTop: 'none',
            borderBottom: 'none'
          }
        }}
      >
        <Box>
          {/* Main Grid Container: All fields are displayed here without sectional headers */}
          <Grid container spacing={2}>
            {allFields.map(field => 
              renderDetailItemContent(
                field.label, 
                field.value, 
                field.multiline, 
                field.gridXs,
                field.rows 
              )
            )}
          </Grid>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ViewJobDetails;