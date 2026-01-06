// src/components/NewCandidate.jsx
import React from 'react';
import { Box, Typography } from '@mui/material';

const NewCandidate = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" color="text.primary">
        New Candidate Page
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
        This is the empty page ready for new content.
      </Typography>
    </Box>
  );
};

export default NewCandidate;