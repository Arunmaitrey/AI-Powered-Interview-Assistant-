import React from 'react';
import { 
  Box, 
  CircularProgress, 
  Typography, 
  Fade 
} from '@mui/material';

const LoadingSpinner = ({ 
  message = 'Loading...', 
  size = 40, 
  showMessage = true,
  fullScreen = false,
  color = 'primary'
}) => {
  const content = (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      gap: 2
    }}>
      <Fade in={true} timeout={500}>
        <CircularProgress 
          size={size} 
          color={color}
          sx={{
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            }
          }}
        />
      </Fade>
      {showMessage && (
        <Fade in={true} timeout={800}>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              textAlign: 'center',
              fontWeight: 500
            }}
          >
            {message}
          </Typography>
        </Fade>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Box sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {content}
      </Box>
    );
  }

  return content;
};

export default LoadingSpinner;
