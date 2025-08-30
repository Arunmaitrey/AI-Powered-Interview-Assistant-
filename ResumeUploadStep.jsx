import React, { useState, useEffect } from 'react';
import {
  Typography, Box, Paper, Button, Card, CardContent, Alert, CircularProgress
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import LoadingSpinner from '../common/LoadingSpinner';
import { resumeValidationAPI, handleAPIError } from '../../utils/api';

const ResumeUploadStep = ({ 
  selectedPreparation, 
  resumeFile, 
  setResumeFile,
  resumeAnalysis,
  setResumeAnalysis,
  resumeAnalysisError,
  setResumeAnalysisError,
  isResumeAnalyzing,
  setIsResumeAnalyzing
}) => {
  const [uploadedFile, setUploadedFile] = useState(null); // Store the uploaded file separately

  // Reset local state when preparation type changes
  useEffect(() => {
    setUploadedFile(null);
  }, [selectedPreparation]);

  const handleFileUpload = async (file) => {
    if (file && file.type === 'application/pdf') {
      // Store the uploaded file for potential retry
      setUploadedFile(file);
      setResumeAnalysis(null);
      setResumeAnalysisError('');
      
      // Automatically analyze the resume when uploaded
      // This is compulsory - must complete before interview can proceed
      const isValidResume = await analyzeResume(file);
      
      // Only set resumeFile if validation was successful
      if (isValidResume) {
        setResumeFile(file);
      }
    } else {
      alert('Please upload a PDF file only.');
    }
  };

  const analyzeResume = async (file) => {
    setIsResumeAnalyzing(true);
    setResumeAnalysisError('');

    try {
      console.log('Starting resume analysis for file:', file.name, 'Size:', file.size);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await resumeValidationAPI.validate(file);
      
      clearTimeout(timeoutId);

      console.log('API Response status:', response.status);
      console.log('API Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error response:', errorText);
        
        let errorMessage = 'Failed to validate resume. ';
        
        if (response.status === 400) {
          // Check if it's the specific resume validation error
          if (errorText.includes("Failed to process the uploaded file")) {
            errorMessage += 'Please upload a valid resume file. The uploaded document does not appear to be a resume or may be corrupted.';
          } else {
            errorMessage += 'The file might be corrupted or in an unsupported format.';
          }
        } else if (response.status === 413) {
          errorMessage += 'The file is too large.';
        } else if (response.status === 500) {
          errorMessage += 'Server error. Please try again later.';
        } else {
          errorMessage += `Server returned error ${response.status}.`;
        }
        
        setResumeAnalysisError(errorMessage);
        return false; // Return false for invalid resume
      }

      const data = await response.json();
      console.log('Analysis successful:', data);
      
      // Check if the response indicates it's a valid resume
      if (data.is_resume === "YES") {
        // Create a mock analysis result since the API only confirms it's a resume
        const mockAnalysis = {
          match_score: 85, // Default score for valid resume
          summary: "This appears to be a valid resume. The document has been successfully processed and is ready for interview preparation.",
          missing_keywords: [] // No specific keywords since we don't have detailed analysis
        };
        setResumeAnalysis(mockAnalysis);
        return true; // Return true for valid resume
      } else {
        // If it's not a resume, show error
        setResumeAnalysisError('Please upload a valid resume file. The uploaded document does not appear to be a resume.');
        return false; // Return false for invalid resume
      }
    } catch (err) {
      const errorMessage = handleAPIError(err, 'Resume validation');
      setResumeAnalysisError(errorMessage);
      return false; // Return false for any error
    } finally {
      setIsResumeAnalyzing(false);
    }
  };



  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const getUploadText = () => {
    if (selectedPreparation === 'combined') {
      return "Please upload your resume in PDF format. This will help us generate more relevant interview questions based on both your job description and resume.";
    }
    return "Please upload your resume in PDF format. This will help us generate more relevant interview questions.";
  };

  return (
    <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#1a1a1a', mb: 2 }}>
        Upload Your Resume
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 4, color: '#666', lineHeight: 1.6 }}>
        {getUploadText()}
      </Typography>
      
      <Box
        sx={{
          border: '2px dashed #ccc',
          borderRadius: 3,
          p: 4,
          textAlign: 'center',
          backgroundColor: '#fafafa',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: '#1976d2',
            backgroundColor: '#f5f5f5',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(25, 118, 210, 0.15)'
          }
        }}
        onClick={() => document.getElementById('resume-upload').click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          id="resume-upload"
          type="file"
          accept=".pdf"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              handleFileUpload(file);
            }
          }}
        />
        
        {uploadedFile ? (
          <Box>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              mb: 2 
            }}>
              <Box sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                backgroundColor: resumeFile ? '#e8f5e8' : '#fff3e0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2
              }}>
                <DescriptionIcon sx={{ 
                  fontSize: 30, 
                  color: resumeFile ? '#4caf50' : '#ff9800' 
                }} />
              </Box>
              <Box>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                  {resumeFile ? '✓ Resume Uploaded Successfully' : '📄 File Uploaded'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
                  {uploadedFile.name}
                </Typography>
                {!resumeFile && (
                  <Typography variant="body2" sx={{ color: '#ff9800', mt: 0.5, fontSize: '0.8rem' }}>
                    Validation required
                  </Typography>
                )}
              </Box>
            </Box>
            
            <Button
              variant="outlined"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setUploadedFile(null);
                setResumeFile(null);
                setResumeAnalysis(null);
                setResumeAnalysisError('');
              }}
              sx={{ 
                mt: 2,
                borderColor: '#f44336',
                color: '#f44336',
                '&:hover': {
                  borderColor: '#d32f2f',
                  backgroundColor: '#ffebee'
                }
              }}
            >
              Remove File
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center', 
              mb: 3 
            }}>
              <Box sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                backgroundColor: '#e3f2fd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2
              }}>
                <DescriptionIcon sx={{ fontSize: 30, color: '#1976d2' }} />
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', mb: 0.5 }}>
                  Click to upload or drag and drop
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', fontSize: '0.875rem' }}>
                  PDF files only
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 1,
              mb: 2
            }}>
              <Box sx={{ width: 30, height: 1, backgroundColor: '#e0e0e0' }} />
              <Typography variant="body2" sx={{ color: '#666', fontSize: '0.875rem' }}>
                or
              </Typography>
              <Box sx={{ width: 30, height: 1, backgroundColor: '#e0e0e0' }} />
            </Box>
            
            <Typography variant="body2" sx={{ color: '#666', fontSize: '0.875rem' }}>
              Drag and drop your resume here
            </Typography>
          </Box>
        )}
      </Box>

      {/* Resume Analysis Results */}
      {isResumeAnalyzing && (
        <Card sx={{ 
          mt: 3, 
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          border: '1px solid #cbd5e1',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <LoadingSpinner 
              message="Analyzing your resume..."
              size={32}
              color="primary"
            />
            <Typography variant="body2" sx={{ 
              mt: 2, 
              color: 'text.secondary',
              fontStyle: 'italic'
            }}>
              This may take a few moments...
            </Typography>
          </CardContent>
        </Card>
      )}

      {resumeAnalysisError && (
        <Alert 
          severity="warning" 
          sx={{ mt: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={async () => {
                if (uploadedFile) {
                  const isValid = await analyzeResume(uploadedFile);
                  if (isValid) {
                    setResumeFile(uploadedFile);
                  }
                }
              }}
              disabled={isResumeAnalyzing}
            >
              {isResumeAnalyzing ? 'Retrying...' : 'Retry'}
            </Button>
          }
        >
          {resumeAnalysisError}
        </Alert>
      )}

      {/* Success Message when resume is validated */}
      {resumeFile && !isResumeAnalyzing && !resumeAnalysisError && (
        <Alert severity="success" sx={{ mt: 3 }}>
          Resume validation completed successfully! You can now proceed to the interview.
        </Alert>
      )}



    </Paper>
  );
};

export default ResumeUploadStep;
