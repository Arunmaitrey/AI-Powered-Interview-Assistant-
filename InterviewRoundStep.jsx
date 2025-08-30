import React from 'react';
import { 
  Typography, Box, Paper, Tooltip 
} from '@mui/material';

const InterviewRoundStep = ({ selectedInterviewRound, setSelectedInterviewRound }) => {
  const interviewRounds = [
    {
      id: 'screening',
      title: 'Telephonic Round',
      step: 1,
      expectation: 'Interviewer\'s expectation',
      description: 'This round focuses on initial screening questions about your background, communication skills, salary expectations, and how well you align with the role requirements. It\'s typically conducted over the phone and serves as the first filter in the interview process.',
      tags: ['HR', 'Communication', 'Salary', 'Role Alignment']
    },
    {
      id: 'technical',
      title: 'Technical Round',
      step: 2,
      expectation: 'Technical skills assessment',
      description: 'This round evaluates your technical expertise through coding challenges, algorithm problems, system design discussions, and problem-solving scenarios. It assesses your ability to think critically, write clean code, and design scalable solutions.',
      tags: ['Coding', 'Algorithms', 'System Design', 'Problem Solving']
    },
    {
      id: 'behavioral',
      title: 'Behavioral Round',
      step: 3,
      expectation: 'Past experiences & situations',
      description: 'This round explores your past experiences, leadership abilities, teamwork skills, and how you handle challenging situations. It uses behavioral questions to understand your work style, decision-making process, and cultural fit within the organization.',
      tags: ['Leadership', 'Teamwork', 'Conflict Resolution', 'Achievements']
    },
    {
      id: 'final',
      title: 'Final Round',
      step: 4,
      expectation: 'Senior management discussion',
      description: 'This final round involves discussions with senior leaders or executives about your strategic thinking, long-term vision, cultural alignment, and career aspirations. It\'s the last step to ensure you\'re the right fit for the organization\'s leadership and future direction.',
      tags: ['Strategy', 'Vision', 'Culture Fit', 'Career Goals']
    }
  ];

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#1a1a1a', mb: 2 }}>
        Which interview round are you practicing for?
      </Typography>
      <Typography variant="body1" sx={{ color: '#666', mb: 4 }}>
        Select the round that matches your current preparation needs
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {interviewRounds.map((round) => (
          <Box
            key={round.id}
            onClick={() => setSelectedInterviewRound(round.id)}
            sx={{
              display: 'flex',
              p: 3,
              border: selectedInterviewRound === round.id ? '2px solid #1976d2' : '1px solid #e0e0e0',
              borderRadius: 3,
              backgroundColor: selectedInterviewRound === round.id ? '#f8f9ff' : 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative',
              '&:hover': {
                borderColor: '#1976d2',
                backgroundColor: '#f8f9ff',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(25, 118, 210, 0.15)'
              }
            }}
          >
            {/* Step Indicator */}
            <Box sx={{ mr: 3 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: selectedInterviewRound === round.id ? '#1976d2' : '#f5f5f5',
                  color: selectedInterviewRound === round.id ? 'white' : '#666',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  boxShadow: selectedInterviewRound === round.id ? '0 4px 12px rgba(25, 118, 210, 0.3)' : 'none'
                }}
              >
                {round.step}
              </Box>
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333', mb: 1 }}>
                {round.title}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1" sx={{ color: '#666', mr: 1, fontWeight: 500 }}>
                  {round.expectation}
                </Typography>
                <Tooltip 
                  title={round.description}
                  arrow
                  placement="top"
                  sx={{
                    '& .MuiTooltip-tooltip': {
                      backgroundColor: '#333',
                      color: 'white',
                      fontSize: '14px',
                      maxWidth: 350,
                      textAlign: 'center',
                      padding: '12px 16px',
                      borderRadius: '8px'
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      backgroundColor: '#e0e0e0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      color: '#666',
                      cursor: 'help',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: '#1976d2',
                        color: 'white'
                      }
                    }}
                  >
                    i
                  </Box>
                </Tooltip>
              </Box>
              
              <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                Questions based on:
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {round.tags.map((tag, index) => (
                  <Box 
                    key={index}
                    sx={{ 
                      backgroundColor: selectedInterviewRound === round.id ? '#e3f2fd' : '#f5f5f5',
                      color: selectedInterviewRound === round.id ? '#1976d2' : '#666',
                      px: 2, 
                      py: 0.8, 
                      borderRadius: 2, 
                      fontSize: '13px', 
                      fontWeight: 500,
                      border: selectedInterviewRound === round.id ? '1px solid #bbdefb' : '1px solid #e0e0e0',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {tag}
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Selection Indicator */}
            {selectedInterviewRound === round.id && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: '#1976d2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold'
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

export default InterviewRoundStep;

