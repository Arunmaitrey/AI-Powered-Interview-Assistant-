import { useState } from 'react';
import {
  Button,
  Container,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  TextField,
  Paper,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import WorkIcon from '@mui/icons-material/Work';

const InterviewSetup = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [resumeFile, setResumeFile] = useState(null);
  const [difficulty, setDifficulty] = useState('medium');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const steps = ['Upload Resume', 'Select Difficulty', 'Job Information'];

  const handleNext = () => {
    if (activeStep === 0 && !resumeFile) {
      setError('Please upload your resume to continue');
      return;
    }
    setError('');
    
    if (activeStep === steps.length - 1) {
      navigate('/interview', {
        state: {
          resumeFile,
          difficulty,
          jobTitle: jobTitle.trim(),
          jobDescription: jobDescription.trim()
        }
      });
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && !['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
      setError('Please upload a PDF or DOCX file');
      return;
    }
    setError('');
    setResumeFile(file);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {activeStep === 0 && (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Upload Your Resume (Required)
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Please upload your resume to help tailor your interview questions.
            Supported formats: PDF, DOCX
          </Typography>
          
          <Button
            variant="contained"
            component="label"
            startIcon={<UploadFileIcon />}
            sx={{ mb: 3 }}
          >
            Upload Resume
            <input
              type="file"
              hidden
              accept=".pdf,.docx"
              onChange={handleFileChange}
              required
            />
          </Button>
          
          {resumeFile && (
            <Typography variant="body2">
              Selected file: {resumeFile.name}
            </Typography>
          )}
        </Paper>
      )}

      {activeStep === 1 && (
        <Paper elevation={3} sx={{ p: 4 }}>
          <FormControl component="fieldset" fullWidth>
            <FormLabel component="legend">
              <Typography variant="h5" gutterBottom>
                Select Interview Difficulty
              </Typography>
            </FormLabel>
            <RadioGroup
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              sx={{ mt: 2 }}
            >
              <FormControlLabel
                value="easy"
                control={<Radio />}
                label={
                  <Box sx={{ ml: 1 }}>
                    <Typography fontWeight="bold">Easy</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Basic questions about your background and experience
                    </Typography>
                  </Box>
                }
                sx={{ mb: 2, alignItems: 'flex-start' }}
              />
              <FormControlLabel
                value="medium"
                control={<Radio />}
                label={
                  <Box sx={{ ml: 1 }}>
                    <Typography fontWeight="bold">Medium</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Mix of behavioral and role-specific questions
                    </Typography>
                  </Box>
                }
                sx={{ mb: 2, alignItems: 'flex-start' }}
              />
              <FormControlLabel
                value="hard"
                control={<Radio />}
                label={
                  <Box sx={{ ml: 1 }}>
                    <Typography fontWeight="bold">Hard</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Challenging scenario-based and technical questions
                    </Typography>
                  </Box>
                }
                sx={{ alignItems: 'flex-start' }}
              />
            </RadioGroup>
          </FormControl>
        </Paper>
      )}

      {activeStep === 2 && (
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Job Information (Optional)
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Providing job details will help tailor your interview questions
          </Typography>

          <TextField
            fullWidth
            label="Job Title"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g. Software Engineer, Marketing Manager"
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: <WorkIcon sx={{ mr: 1, color: 'action.active' }} />
            }}
          />

          <TextField
            fullWidth
            label="Job Description"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            multiline
            rows={6}
            placeholder="Paste the job description here for more tailored questions..."
          />
        </Paper>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          variant="outlined"
          sx={{ minWidth: 100 }}
        >
          Back
        </Button>
        
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={activeStep === 0 && !resumeFile}
          sx={{ minWidth: 100 }}
        >
          {activeStep === steps.length - 1 ? 'Start Interview' : 'Continue'}
        </Button>
      </Box>
    </Container>
  );
};

export default InterviewSetup;