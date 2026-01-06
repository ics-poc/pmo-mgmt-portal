import React from "react";
import { AppBar, Toolbar, Typography, IconButton, Button, Box} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useLocation } from "react-router-dom";

const Header = ({ onBack, showBack, title, onLogout }) => {
    const location = useLocation();
const isWelcomePage = location.pathname === "/";

  return (
    // Use AppBar for the fixed header
    <AppBar 
        position="fixed" 
        sx={{ 
            zIndex: (theme) => theme.zIndex.drawer + 1,
            height: (theme) => theme.app.headerHeight,
        }}
    >
        <Toolbar sx={{ minHeight: '64px', display: 'flex' }}>
  
  {/* LEFT SIDE: Back + Title */}
  <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
    {showBack && (
      <IconButton
        color="inherit"
        onClick={onBack}
        sx={{ mr: 2 }}
        edge="start"
        aria-label="back"
      >
        <ArrowBackIcon />
      </IconButton>
    )}

    <Typography
      variant="h6"
      noWrap
      component="div"
      sx={{
        fontWeight: 'bold',
        fontSize: '1.5em',
      }}
    >
      {title || "Shortlisting System"}
    </Typography>
  </Box>

  {/* RIGHT SIDE: Logout */}
 {onLogout && (
  <Button
    color="inherit"
    onClick={onLogout}
    sx={{
      textTransform: 'none',
      fontWeight: 600,
      border: '1px solid rgba(255,255,255,0.6)',
      borderRadius: 2,
      px: 2,
      '&:hover': {
        backgroundColor: 'rgba(255,255,255,0.1)',
      },
    }}
  >
    Logout
  </Button>
)}

</Toolbar>

    </AppBar>
  );
};

export default Header;