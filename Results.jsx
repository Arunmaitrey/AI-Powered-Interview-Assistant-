import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import DownloadIcon from '@mui/icons-material/Download';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const Results = () => {
  const location = useLocation();
  const { 
    resumeFile, 
    difficulty, 
    jobTitle, 
    jobDescription,
    interviewData = [],
    overallFeedback
  } = location.state || {};
  const navigate = useNavigate();

  const handleRestart = () => {
    navigate('/setup');
  };

  const renderScoreBar = (score, label) => {
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          {label}: {score}/5
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={score * 20} 
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: '#e0e0e0',
            '& .MuiLinearProgress-bar': {
              backgroundColor: 
                score < 2 ? '#f44336' :
                score < 3 ? '#ff9800' :
                score < 4 ? '#ffc107' :
                '#4caf50'
            }
          }}
        />
      </Box>
    );
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Interview Results
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Interview Details
        </Typography>
        <List>
          {resumeFile && (
            <ListItem>
              <ListItemText 
                primary="Resume" 
                secondary={resumeFile.name} 
              />
              <Button 
                variant="outlined" 
                startIcon={<DownloadIcon />}
                onClick={() => {
                  const url = URL.createObjectURL(resumeFile);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = resumeFile.name;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Download
              </Button>
            </ListItem>
          )}
          <ListItem>
            <ListItemText 
              primary="Difficulty Level" 
              secondary={
                <Chip 
                  label={difficulty} 
                  color={
                    difficulty === 'easy' ? 'success' :
                    difficulty === 'medium' ? 'warning' : 'error'
                  } 
                />
              } 
            />
          </ListItem>
          {jobTitle && (
            <ListItem>
              <ListItemText primary="Job Title" secondary={jobTitle} />
            </ListItem>
          )}
        </List>
      </Paper>

      {overallFeedback && (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Overall Performance
          </Typography>
          {renderScoreBar(overallFeedback.scores.overall, "Overall Score")}
          {renderScoreBar(overallFeedback.scores.clarity, "Clarity")}
          {renderScoreBar(overallFeedback.scores.structure, "Structure")}
          {renderScoreBar(overallFeedback.scores.confidence, "Confidence")}
          {renderScoreBar(overallFeedback.scores.relevance, "Relevance")}
          {renderScoreBar(overallFeedback.scores.communication, "Communication")}
          
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            Overall Suggestions:
          </Typography>
          <ul style={{ marginTop: 0, paddingLeft: 20 }}>
            {overallFeedback.feedback.suggestions.map((suggestion, index) => (
              <li key={index}>
                <Typography variant="body2">{suggestion}</Typography>
              </li>
            ))}
          </ul>
        </Paper>
      )}

      {interviewData.length > 0 && (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Detailed Question Feedback
          </Typography>
          {interviewData.map((item, index) => (
            <Accordion key={index} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>
                  Question {index + 1}: {item.question} (Score: {item.feedback.scores.overall}/5)
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>Your Answer:</strong> {item.answer}
                </Typography>
                {renderScoreBar(item.feedback.scores.clarity, "Clarity")}
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {item.feedback.feedback.clarity}
                </Typography>
                {renderScoreBar(item.feedback.scores.structure, "Structure")}
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {item.feedback.feedback.structure}
                </Typography>
                {renderScoreBar(item.feedback.scores.confidence, "Confidence")}
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {item.feedback.feedback.confidence}
                </Typography>
                {renderScoreBar(item.feedback.scores.relevance, "Relevance")}
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {item.feedback.feedback.relevance}
                </Typography>
                {renderScoreBar(item.feedback.scores.communication, "Communication")}
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {item.feedback.feedback.communication}
                </Typography>
                <Typography variant="subtitle2" sx={{ mt: 1 }}>
                  Suggestions:
                </Typography>
                <ul style={{ marginTop: 0, paddingLeft: 20 }}>
                  {item.feedback.suggestions.map((suggestion, i) => (
                    <li key={i}>
                      <Typography variant="body2">{suggestion}</Typography>
                    </li>
                  ))}
                </ul>
              </AccordionDetails>
            </Accordion>
          ))}
        </Paper>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleRestart}
          sx={{ minWidth: 200 }}
        >
          Start New Interview
        </Button>
      </Box>
    </Container>
  );
};

export default Results;