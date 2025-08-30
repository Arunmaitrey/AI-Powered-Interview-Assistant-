import React from 'react';
import { 
  Typography, Box, Paper 
} from '@mui/material';

const DifficultyStep = ({ difficulty, setDifficulty }) => {
  const difficultyLevels = [
    {
      id: 'easy',
      title: 'Easy Level',
      interviewer: 'Emma',
      experience: '3+ years',
      personality: 'Supportive',
      description: 'She asks simple questions',
      avatar: '/emma-avatar.png',
      color: '#4caf50',
      bgColor: '#f1f8e9',
      borderColor: '#4caf50'
    },
    {
      id: 'medium',
      title: 'Medium Level',
      interviewer: 'Miley',
      experience: '5+ years',
      personality: 'Neutral',
      description: 'She asks intermediate questions',
      avatar: '/miley-avatar.png',
      color: '#ff9800',
      bgColor: '#fff8e1',
      borderColor: '#ff9800'
    },
    {
      id: 'hard',
      title: 'Hard Level',
      interviewer: 'David',
      experience: '10+ years',
      personality: 'Intense',
      description: 'He asks difficult questions',
      avatar: '/david-avatar.png',
      color: '#f44336',
      bgColor: '#ffebee',
      borderColor: '#f44336'
    }
  ];

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#1a1a1a', mb: 2 }}>
        Set Difficulty Level
      </Typography>
      <Typography variant="body1" sx={{ color: '#666', mb: 4 }}>
        Choose the difficulty level for your interview. Please select one option to continue.
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {difficultyLevels.map((level) => (
          <Box
            key={level.id}
            onClick={() => setDifficulty(level.id)}
            sx={{
              display: 'flex',
              p: 3,
              border: difficulty === level.id ? `2px solid ${level.borderColor}` : '1px solid #e0e0e0',
              borderRadius: 3,
              backgroundColor: difficulty === level.id ? level.bgColor : 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative',
              '&:hover': {
                borderColor: level.borderColor,
                backgroundColor: level.bgColor,
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 25px ${level.color}20`
              }
            }}
          >
            {/* Left Accent */}
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '4px',
                backgroundColor: level.color,
                borderTopLeftRadius: 3,
                borderBottomLeftRadius: 3
              }}
            />

            {/* Profile Picture */}
            <Box sx={{ mr: 3, position: 'relative' }}>
              <Box
                sx={{
                  width: 70,
                  height: 70,
                  borderRadius: '50%',
                  backgroundColor: level.bgColor,
                  border: `3px solid ${level.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: difficulty === level.id ? `0 4px 15px ${level.color}40` : '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                <img
                  src={level.avatar}
                  alt={`${level.interviewer} - ${level.title} Interviewer`}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
              </Box>
              
              {/* Experience Badge */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -5,
                  right: -5,
                  backgroundColor: level.color,
                  color: 'white',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                  fontSize: '11px',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                {level.experience}
              </Box>
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333', mr: 2 }}>
                  {level.title}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: level.color }}>
                  {level.interviewer}
                </Typography>
              </Box>
              
              <Typography variant="body1" sx={{ color: '#666', mb: 1, fontWeight: 500 }}>
                {level.personality}
              </Typography>
              
              <Typography variant="body1" sx={{ color: '#666' }}>
                {level.description}
              </Typography>
            </Box>

            {/* Selection Indicator */}
            {difficulty === level.id && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: level.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  boxShadow: `0 4px 12px ${level.color}40`
                }}
              >
                ✓
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default DifficultyStep;
