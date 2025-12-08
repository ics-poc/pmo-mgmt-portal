// FileUpload.jsx
import React, { useState, useRef, useEffect }  from 'react';
import { Box, Button, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const FileUpload = ({ setCandidateFile, setCandidateFileName, fileNameProp, handleUpload, isUploading }) => {
    const [fileName, setFileName] = React.useState(fileNameProp || ''); 
    const fileInputRef = React.useRef(null);
    useEffect(() => {
        if (fileNameProp) {
            setFileName(fileNameProp);
        }
    }, [fileNameProp]);
    
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      const name = file.name;
      setFileName(name);
      setCandidateFileName(name); // <-- Update parent state
      setCandidateFile(file);
      
      // CRITICAL CHANGE: Trigger upload automatically here after file selection
      if (handleUpload) {
        handleUpload(file, name); // Pass the file name to the API handler
      }
      
    }
    // Clear the input value so the same file can be selected again
    e.target.value = null; 
  };

  const openPicker = () => fileInputRef.current?.click();
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
      {/* Left: Heading + Status (tight) */}
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#2c3e50', m: 0 }}>
          Candidate Data
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          File Name:{' '}
          <span style={{ 
            color: fileName ? '#4caf50' : '#f44336', 
            fontWeight: 600 
          }}>
            {fileName || 'No file selected'}
          </span>
        </Typography>
      </Box>

      {/* Right: Upload Button */}
      <Box>
        {/* Input now triggers the upload via its onChange handler */}
        <input 
          ref={fileInputRef} 
          type="file" 
          hidden 
          accept=".xlsx,.xls,.csv" 
          onChange={handleFileChange} 
        />
        
        <Button
          variant="contained"
          startIcon={<CloudUploadIcon />}
          // MODIFIED: Button only opens the file picker
          onClick={openPicker} 
          disabled={isUploading}
          sx={{ 
            bgcolor: '#4da6ff',
            color: 'white',
            fontWeight: '600',
            textTransform: 'uppercase',
            p: '8px 16px',
            borderRadius: '8px',
            '&:hover': { bgcolor: '#1976d2' },
            '&:disabled': { bgcolor: '#ccc', color: 'rgba(0, 0, 0, 0.26)' },
            fontSize: '0.875rem', 
          }} 
        >
          {isUploading ? 'Processing...' : 'Upload Candidate Data'} 
        </Button>
      </Box>
    </Box>
  );
};

export default FileUpload;