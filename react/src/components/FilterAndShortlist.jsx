import React from 'react';
import { Box, Typography } from '@mui/material';

/**
 * Component for displaying static job requirement details.
 * @param {object} props
 * @param {string} props.label - The label for the filter box.
 * @param {string} props.value - The value to display inside the box.
 */
const FilterAndShortlist = ({ label, value }) => (
    <Box sx={{ 
        mb: 2.5, 
        p: 1.875, // 15px
        border: '1px solid #e3f2fd', 
        borderRadius: '8px', 
        backgroundColor: '#f8f9fa' 
    }}>
        <Typography 
            component="label" 
            variant="caption"
            sx={{ 
                display: 'block', 
                mb: 1, 
                fontWeight: 'bold', 
                color: 'primary.main',
                fontSize: '0.8rem'
            }}
        >
            {label}
        </Typography>
        <Box sx={{ 
            p: 1.25, // 10px
            border: '1px solid #ccc', 
            borderRadius: '4px', 
            backgroundColor: 'white',
            minHeight: '40px',
            color: '#333',
            wordBreak: 'break-word'
        }}>
            <Typography variant="body2">{value || 'N/A'}</Typography>
        </Box>
    </Box>
);

export default FilterAndShortlist;