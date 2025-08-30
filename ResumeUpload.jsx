import { useState } from 'react';
import { Button, Container, Typography, Box, LinearProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = () => {
    setIsUploading(true);
    
    // Simulate preparation progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          navigate('/interview');
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  return (
    <Container maxWidth="sm" className="resume-upload">
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          How are you planning to prepare?
        </Typography>
        <Typography variant="body1" gutterBottom sx={{ mb: 4 }}>
          This helps us generate personalized questions for your interview.
        </Typography>
        
        {isUploading && (
          <Box sx={{ width: '100%', mb: 2 }}>
            <LinearProgress variant="determinate" value={uploadProgress} />
            <Typography variant="body2">{uploadProgress}%</Typography>
          </Box>
        )}
        
        <Button
          variant="contained"
          color="primary"
          disabled={isUploading}
          onClick={handleUpload}
          size="large"
        >
          {isUploading ? 'Preparing...' : 'Start Interview'}
        </Button>
      </Box>
    </Container>
  );
};

export default ResumeUpload;