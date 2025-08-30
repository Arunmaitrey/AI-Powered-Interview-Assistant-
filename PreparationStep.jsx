import React from 'react';
import { 
  Button, Typography, Box, Paper 
} from '@mui/material';

const PreparationStep = ({ selectedPreparation, setSelectedPreparation }) => {
  const preparationOptions = [
    {
      id: 'resume',
      title: 'Prepare for job role with your resume',
      subtitle: '(NOT COMPANY SPECIFIC)',
      icon: 'resume',
      description: 'Use your resume to generate role-specific questions'
    },
    {
      id: 'job-description',
      title: 'Prepare with any job description',
      subtitle: '(IF YOU DON\'T HAVE RESUME)',
      icon: 'job-description',
      description: 'Use job description to create relevant questions'
    },
    {
      id: 'combined',
      title: 'Prepare with the job description and your resume',
      subtitle: '',
      icon: 'combined',
      description: 'Get the most personalized questions using both'
    }
  ];

  const renderIcon = (iconType) => {
    const iconStyles = {
      width: 80,
      height: 80,
      position: 'relative',
      transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
      mr: 4,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    };

    const imageStyles = {
      width: '120%',
      height: '120%',
      objectFit: 'cover',
      borderRadius: '8px',
      transition: 'all 0.3s ease',
      transform: 'scale(1.2)',
      objectPosition: 'center'
    };

    switch (iconType) {
      case 'resume':
        return (
          <Box sx={iconStyles}>
            <img 
              src="/resume-icon.jpg" 
              alt="Resume Icon" 
              style={imageStyles}
            />
          </Box>
        );
      case 'job-description':
        return (
          <Box sx={iconStyles}>
            <img 
              src="/job-icon.jpg" 
              alt="Job Description Icon" 
              style={imageStyles}
            />
          </Box>
        );
      case 'combined':
        return (
          <Box sx={iconStyles}>
            <img 
              src="/resume+job-icon.jpg" 
              alt="Resume and Job Description Icon" 
              style={imageStyles}
            />
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#1a1a1a', mb: 1 }}>
        How are you planning to prepare?
      </Typography>
      <Typography variant="body1" sx={{ color: '#666', mb: 4 }}>
        Choose the method that best fits your preparation needs. Click any option to continue.
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: 3, 
        width: '100%',
        maxWidth: 600,
        mx: 'auto'
      }}>
        {preparationOptions.map((option) => (
          <Button
            key={option.id}
            variant="outlined"
            size="large"
            startIcon={renderIcon(option.icon)}
            onClick={() => {
              setSelectedPreparation(option.id);
              // Auto-advance will be handled by parent component
            }}
            sx={{
              px: 6,
              py: 4,
              fontSize: '1.1rem',
              fontWeight: 500,
              borderRadius: 3,
              textTransform: 'none',
              borderWidth: 2,
              borderColor: selectedPreparation === option.id ? '#1976d2' : '#e0e0e0',
              color: selectedPreparation === option.id ? '#ffffff' : '#1976d2',
              backgroundColor: selectedPreparation === option.id ? '#1976d2' : '#ffffff',
              position: 'relative',
              overflow: 'hidden',
              minHeight: 120,
              height: 'auto',
              width: '100%',
              maxWidth: 500,
              boxShadow: selectedPreparation === option.id ? '0 4px 20px rgba(25, 118, 210, 0.15)' : '0 2px 8px rgba(0,0,0,0.1)',
              '&:before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                transition: 'left 0.5s ease',
              },
              '&:hover': {
                backgroundColor: selectedPreparation === option.id ? '#1565c0' : '#e3f2fd',
                borderColor: '#1565c0',
                color: selectedPreparation === option.id ? '#ffffff' : '#1565c0',
                transform: 'translateY(-3px) scale(1.02)',
                boxShadow: '0 8px 25px rgba(25, 118, 210, 0.25)',
                '&:before': {
                  left: '100%',
                }
              },
              '&:active': {
                transform: 'translateY(-1px) scale(1.01)',
                boxShadow: '0 4px 15px rgba(25, 118, 210, 0.2)',
              },
              transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
            }}
          >
            <Box sx={{ textAlign: 'left', flex: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                {option.title}
              </Typography>
              {option.subtitle && (
                <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.9rem', lineHeight: 1.3 }}>
                  {option.subtitle}
                </Typography>
              )}
            </Box>
          </Button>
        ))}
      </Box>
    </Paper>
  );
};

export default PreparationStep;
