// src/ProgressSteps.js (MODIFIED to make the tab bar bigger)
import React from 'react';
import { Box, Typography } from '@mui/material';

const tabs = [
  'BR Data',
  'Candidate Data',
  'Analysis'
];

const ProgressSteps = ({ activeTab, onTabChange }) => {

  const handleTabClick = (index) => {
      if (onTabChange) {
          onTabChange(index);
      }
  };

  return (
    // Main container for the tab bar
    <Box 
        sx={{ 
            display: 'flex', 
            justifyContent: 'flex-start',
            alignItems: 'center', 
            backgroundColor: '#fff', 
            borderBottom: '1px solid #e0e0e0', 
            height: '60px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)', 
            paddingLeft: '16px', 
        }}
    >
      {tabs.map((tab, index) => (
        // Individual tab item
        <Box 
            key={index} 
            onClick={() => handleTabClick(index)}
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                // --- INCREASED HORIZONTAL PADDING ---
                padding: '0 25px', 
                // ------------------------------------
                height: '100%',
                cursor: 'pointer',
                position: 'relative',
                textTransform: 'uppercase',
                fontWeight: index === activeTab ? 600 : 500, 
                color: index === activeTab ? '#1976d2' : '#6c757d', 
                fontSize: '0.915rem', 
                borderBottom: index === activeTab ? '3px solid #1976d2' : '3px solid transparent',
                transition: 'all 0.2s ease', 
                
                '&:hover': {
                    backgroundColor: '#f8f9fa', 
                    color: index === activeTab ? '#1976d2' : '#5a6268',
                },
            }}
        >
          <Typography 
            variant="body2" 
            component="span"
            sx={{
                color: 'inherit', 
                fontWeight: 'inherit',
                fontSize: 'inherit',
                letterSpacing: '0.025em',
            }}
          >
            {tab}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default ProgressSteps;