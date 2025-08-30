import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Box,
  CircularProgress,
  Container,
} from '@mui/material';
import { interviewEvaluationAPI, handleAPIError } from './utils/api';

const Test = () => {
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleEvaluate = async () => {
    setLoading(true);
    setError(null);

    const payload = {
      items: [
        {
          question: 'What is a Python decorator?',
          answer: 'to add more functionality',
        },
        {
          question: 'What is the time complexity of binary search?',
          answer: 'O(log n)',
        },
      ],
    };

        try {
      const response = await interviewEvaluationAPI.evaluate(payload);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setFeedback(data.results);
    } catch (err) {
      const errorMessage = handleAPIError(err, 'Interview evaluation');
      setError(errorMessage);
    }

    setLoading(false);
  };

  return (
    <Container maxWidth="md">
      <Box mt={4} mb={2}>
        <Typography variant="h4" gutterBottom>
          Evaluation Feedback
        </Typography>
        <Button variant="contained" onClick={handleEvaluate} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Evaluate Answers'}
        </Button>
        {error && (
          <Typography color="error" mt={2}>
            {error}
          </Typography>
        )}
      </Box>

      {feedback && feedback.map((item, index) => (
        <Card key={index} variant="outlined" sx={{ mb: 3, borderRadius: 3, boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Q{index + 1}: {item.question}
            </Typography>
            <Typography variant="body1" gutterBottom><strong>Your Answer:</strong> {item.answer}</Typography>

            <Grid container spacing={2} mt={1}>
              <Grid item xs={6}>
                <Typography variant="body2"><strong>Clarity:</strong> {item.clarity_score}/10</Typography>
                <Typography variant="body2"><strong>Relevance:</strong> {item.relevance_score}/10</Typography>
                <Typography variant="body2"><strong>Communication:</strong> {item.communication}/10</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2"><strong>Confidence:</strong> {item.confidence}/10</Typography>
                <Typography variant="body2"><strong>Structure:</strong> {item.structure}/10</Typography>
              </Grid>
            </Grid>

            {item.suggestion !== 'N/A' && (
              <Box mt={2}>
                <Typography variant="subtitle2">💡 Suggestion:</Typography>
                <Typography variant="body2">{item.suggestion}</Typography>
              </Box>
            )}

            {item.improvements !== 'N/A' && (
              <Box mt={2}>
                <Typography variant="subtitle2">🔧 Improvements:</Typography>
                <Typography variant="body2">{item.improvements}</Typography>
              </Box>
            )}

            <Box mt={2}>
              <Typography variant="subtitle2">✅ Example Answer:</Typography>
              <Typography variant="body2">{item.example_answer}</Typography>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Container>
  );
};

export default Test;
