import React from "react";
// --- MUI IMPORTS ---
import { AppBar, Toolbar, Typography } from '@mui/material';

const Header = () => {
  return (
    // Use AppBar for the fixed header
    <AppBar 
        position="fixed" 
        sx={{ 
            zIndex: (theme) => theme.zIndex.drawer + 1, // Ensure it's above the sidebar (drawer)
            height: (theme) => theme.app.headerHeight, // Use height defined in theme
            // Remove the hardcoded background color if you want to use theme.primary
            // background: "#0066cc", // Primary Blue
        }}
    >
        <Toolbar sx={{ 
            minHeight: '64px', // Ensure standard Toolbar height
            // We use the theme's defined sidebar width to push content over
            pl: (theme) => ({ xs: 2, sm: `${theme.app.sidebarWidth / 8}px` }), 
        }}> 
            <Typography 
                variant="h6" 
                noWrap 
                component="div"
                sx={{ 
                    fontWeight: 'bold', 
                    fontSize: '1.5em', 
                    ml: '10px' 
                }}
            >
                Candidate Shortlisting System
            </Typography>
        </Toolbar>
    </AppBar>
  );
};

export default Header;