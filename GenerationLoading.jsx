import React from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  LinearProgress, 
  Card, 
  CardContent,
  Fade,
  Zoom
} from '@mui/material';
import { 
  Psychology as PsychologyIcon
} from '@mui/icons-material';

const GenerationLoading = ({ 
  isLoading, 
  progress = 0, 
  currentStep = 'Analyzing your profile...',
  steps = [
    'Analyzing your profile...',
    'Generating personalized questions...',
    'Optimizing difficulty level...',
    'Preparing interview interface...'
  ]
}) => {
  if (!isLoading) return null;

  return (
    <Fade in={isLoading} timeout={500}>
             <Box sx={{
         position: 'fixed',
         top: 0,
         left: 0,
         right: 0,
         bottom: 0,
         backgroundColor: 'rgba(15, 23, 42, 0.85)',
         zIndex: 9999,
         display: 'flex',
         alignItems: 'center',
         justifyContent: 'center',
         backdropFilter: 'blur(12px)'
       }}>
        <Zoom in={isLoading} timeout={800}>
          <Card sx={{
            maxWidth: 500,
            width: '90%',
            mx: 2,
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%)',
            color: 'white',
            borderRadius: 4,
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            overflow: 'visible'
          }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              {/* Main Loading Icon */}
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <CircularProgress
                  size={80}
                  thickness={4}
                  sx={{
                    color: 'rgba(255,255,255,0.3)',
                    '& .MuiCircularProgress-circle': {
                      strokeLinecap: 'round',
                    }
                  }}
                />
              </Box>

              {/* Title */}
              <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                mb: 1,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                Generating Your Interview
              </Typography>

              {/* Subtitle */}
              <Typography variant="body1" sx={{ 
                mb: 4, 
                opacity: 0.9,
                fontSize: '1.1rem'
              }}>
                Creating personalized questions based on your profile
              </Typography>

              {/* Progress Bar */}
              <Box sx={{ mb: 3 }}>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(90deg, #ffffff 0%, #e5f3ff 100%)',
                      borderRadius: 4,
                      boxShadow: '0 0 12px rgba(255,255,255,0.4)'
                    }
                  }}
                />
                <Typography variant="body2" sx={{ 
                  mt: 1, 
                  opacity: 0.8,
                  fontSize: '0.9rem'
                }}>
                  {Math.round(progress)}% Complete
                </Typography>
              </Box>

              {/* Current Step */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mb: 2,
                p: 2,
                backgroundColor: 'rgba(255,255,255,0.08)',
                borderRadius: 2,
                border: '1px solid rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)'
              }}>
                <PsychologyIcon sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2" sx={{ 
                  fontWeight: 500,
                  fontSize: '0.95rem'
                }}>
                  {currentStep}
                </Typography>
              </Box>

              {/* Step Indicators */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                {steps.map((step, index) => {
                  const stepProgress = (index + 1) * (100 / steps.length);
                  const isCompleted = progress >= stepProgress;
                  const isCurrent = progress >= (index * (100 / steps.length)) && progress < stepProgress;
                  
                  return (
                                         <Box
                       key={index}
                       sx={{
                         width: 12,
                         height: 12,
                         borderRadius: '50%',
                         backgroundColor: isCompleted ? '#ffffff' : 'rgba(255,255,255,0.25)',
                         border: isCurrent ? '2px solid #ffffff' : 'none',
                         boxShadow: isCurrent ? '0 0 10px rgba(255,255,255,0.5)' : 'none',
                         transition: 'all 0.3s ease'
                       }}
                     />
                  );
                })}
              </Box>

              {/* Animated Dots */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: 0.5, 
                mt: 2 
              }}>
                {[0, 1, 2].map((index) => (
                  <Box
                    key={index}
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: 'white',
                      animation: `bounce 1.4s ease-in-out infinite both`,
                      animationDelay: `${index * 0.16}s`
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Zoom>

        {/* CSS Animations */}
        <style jsx>{`
          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
          }
        `}</style>
      </Box>
    </Fade>
  );
};

export default GenerationLoading;
