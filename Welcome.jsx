import { Button, Container, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <Container 
      maxWidth="sm" 
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        px: { xs: 2, sm: 3 },
        background: 'radial-gradient(circle at center, rgba(241,245,249,0.8) 0%, rgba(226,232,240,0.9) 100%)'
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 520,
          p: { xs: 3, sm: 4, md: 5 },
          borderRadius: 3,
          bgcolor: 'background.paper',
          boxShadow: '0 12px 40px -12px rgba(0,0,0,0.1)',
          transition: 'all 0.4s ease-out',
          '&:hover': {
            boxShadow: '0 16px 48px -16px rgba(25, 118, 210, 0.2)'
          }
        }}
      >
        <Box
          sx={{
            mb: 4,
            px: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.4rem', sm: '3rem', md: '3.2rem' },
              fontWeight: 300,
              letterSpacing: '-0.5px',
              lineHeight: 1.15,
              mb: 2,
              color: 'text.primary',
              position: 'relative',
              '&:after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 80,
                height: 3,
                background: 'linear-gradient(90deg, #1976d2 0%, #2196f3 100%)',
                borderRadius: 3
              }
            }}
          >
            Interview Elegance
          </Typography>

          <Typography
            variant="subtitle1"
            sx={{
              mt: 3,
              color: 'text.secondary',
              fontSize: { xs: '1.05rem', sm: '1.15rem' },
              lineHeight: 1.6,
              maxWidth: '90%',
              textAlign: 'center',
              fontFamily: "'Georgia', serif",
              fontStyle: 'italic'
            }}
          >
            Where preparation meets poise in the art of conversation
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/interview')}
            sx={{
              px: 5,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 400,
              borderRadius: 50,
              textTransform: 'none',
              letterSpacing: '0.5px',
              borderWidth: 2,
              borderColor: 'primary.main',
              color: 'primary.main',
              transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
              '&:hover': {
                bgcolor: 'primary.main',
                color: 'common.white',
                borderWidth: 2,
                transform: 'translateY(-1px)'
              }
            }}
          >
            Commence Your Journey
          </Button>
          
          <Button
            variant="text"
            size="medium"
            onClick={() => navigate('/resume-checker')}
            sx={{
              px: 3,
              py: 1,
              fontSize: '0.9rem',
              fontWeight: 400,
              textTransform: 'none',
              letterSpacing: '0.3px',
              color: 'text.secondary',
              transition: 'all 0.3s ease',
              '&:hover': {
                color: 'primary.main',
                bgcolor: 'rgba(25, 118, 210, 0.04)',
                transform: 'translateY(-1px)'
              }
            }}
          >
            Check Your Resume
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Welcome;