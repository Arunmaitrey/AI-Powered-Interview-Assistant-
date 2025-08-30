import { Button, Container, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const LevelSelection = () => {
  const navigate = useNavigate();

  const handleLevelSelect = (level) => {
    localStorage.setItem('interviewLevel', level);
    navigate('/interview', { state: { difficulty: level } });
  };

  return (
    <Container 
      maxWidth="sm" 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Box sx={{ width: '100%', textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom>
          Select Interview Level
        </Typography>
        <Typography variant="subtitle1" sx={{ mb: 4, color: 'text.secondary' }}>
          Choose the difficulty level for your interview
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button 
            variant="contained" 
            size="large" 
            color="success"
            onClick={() => handleLevelSelect('easy')}
            sx={{
              py: 2,
              fontSize: '1.1rem'
            }}
          >
            Easy Level
          </Button>
          <Button 
            variant="contained" 
            size="large" 
            color="warning"
            onClick={() => handleLevelSelect('medium')}
            sx={{
              py: 2,
              fontSize: '1.1rem'
            }}
          >
            Medium Level
          </Button>
          <Button 
            variant="contained" 
            size="large" 
            color="error"
            onClick={() => handleLevelSelect('hard')}
            sx={{
              py: 2,
              fontSize: '1.1rem'
            }}
          >
            Hard Level
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default LevelSelection;