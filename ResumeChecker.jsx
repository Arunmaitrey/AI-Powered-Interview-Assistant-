import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Description as FileIcon,
  Assessment as AnalysisIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ResumeChecker = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
      setAnalysis(null);
    } else {
      setError('Please select a valid PDF file.');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setError('');
      setAnalysis(null);
    } else {
      setError('Please drop a valid PDF file.');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a PDF file first.');
      return;
    }

    setIsUploading(true);
    setError('');
    setAnalysis(null);

    const formData = new FormData();
    formData.append('pdf_file', file);

    try {
      const response = await fetch('http://13.204.155.120:8000/api/v1/resume_check', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to analyze resume. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setAnalysis(null);
    setError('');
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#ff9800';
    return '#f44336';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  return (
    <Container 
      maxWidth="md" 
      sx={{
        minHeight: '100vh',
        py: 4,
        background: 'radial-gradient(circle at center, rgba(241,245,249,0.8) 0%, rgba(226,232,240,0.9) 100%)'
      }}
    >
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 300,
            mb: 2,
            color: 'text.primary',
            position: 'relative',
            '&:after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 60,
              height: 3,
              background: 'linear-gradient(90deg, #1976d2 0%, #2196f3 100%)',
              borderRadius: 3
            }
          }}
        >
          Resume Checker
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          Upload your resume and get instant analysis and improvement suggestions
        </Typography>
      </Box>

      {!analysis ? (
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 3,
            bgcolor: 'background.paper',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}
        >
          {/* File Upload Area */}
          <Box
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            sx={{
              border: `2px dashed ${dragActive ? '#1976d2' : '#e0e0e0'}`,
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              bgcolor: dragActive ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              mb: 3
            }}
            onClick={() => document.getElementById('file-input').click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            
            <UploadIcon 
              sx={{ 
                fontSize: 48, 
                color: dragActive ? '#1976d2' : '#9e9e9e',
                mb: 2 
              }} 
            />
            
            <Typography variant="h6" sx={{ mb: 1, color: 'text.primary' }}>
              {dragActive ? 'Drop your PDF here' : 'Upload your resume'}
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              Drag and drop a PDF file here, or click to browse
            </Typography>
          </Box>

          {/* Selected File Display */}
          {file && (
            <Card sx={{ mb: 3, bgcolor: 'rgba(25, 118, 210, 0.04)' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
                <FileIcon sx={{ mr: 2, color: '#1976d2' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    {file.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                </Box>
                <CheckIcon sx={{ color: '#4caf50' }} />
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleUpload}
              disabled={!file || isUploading}
              startIcon={isUploading ? <CircularProgress size={20} /> : <AnalysisIcon />}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500
              }}
            >
              {isUploading ? 'Analyzing...' : 'Analyze Resume'}
            </Button>
            
            {file && (
              <Button
                variant="outlined"
                size="large"
                onClick={handleReset}
                disabled={isUploading}
                startIcon={<RefreshIcon />}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem'
                }}
              >
                Reset
              </Button>
            )}
          </Box>
        </Paper>
      ) : (
        /* Analysis Results */
        <Box>
          {/* Score Card */}
          <Card sx={{ mb: 3, bgcolor: 'background.paper', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <AnalysisIcon sx={{ mr: 2, color: '#1976d2', fontSize: 32 }} />
                <Typography variant="h5" sx={{ fontWeight: 500 }}>
                  Analysis Results
                </Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h2" sx={{ 
                  fontWeight: 300, 
                  color: getScoreColor(analysis.match_score),
                  mb: 1
                }}>
                  {analysis.match_score}%
                </Typography>
                <Typography variant="h6" sx={{ 
                  color: getScoreColor(analysis.match_score),
                  mb: 2
                }}>
                  {getScoreLabel(analysis.match_score)} Match
                </Typography>
                
                <LinearProgress
                  variant="determinate"
                  value={analysis.match_score}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'rgba(0,0,0,0.1)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: getScoreColor(analysis.match_score),
                      borderRadius: 4
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>

          {/* Summary Card */}
          <Card sx={{ mb: 3, bgcolor: 'background.paper', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                Summary
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.6, color: 'text.secondary' }}>
                {analysis.summary}
              </Typography>
            </CardContent>
          </Card>

          {/* Missing Keywords Card */}
          {analysis.missing_keywords && analysis.missing_keywords.length > 0 && (
            <Card sx={{ mb: 3, bgcolor: 'background.paper', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                  Suggested Keywords to Add
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {analysis.missing_keywords.map((keyword, index) => (
                    <Chip
                      key={index}
                      label={keyword}
                      variant="outlined"
                      color="primary"
                      sx={{ fontWeight: 500 }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleReset}
              startIcon={<RefreshIcon />}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500
              }}
            >
              Analyze Another Resume
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/')}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem'
              }}
            >
              Back to Home
            </Button>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default ResumeChecker;

