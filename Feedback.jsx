import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, LinearProgress, Paper,
  Grid, Button, CircularProgress, Alert, Card, CardContent,
  Divider, Accordion, AccordionSummary, AccordionDetails,
  Chip
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const QUESTION_CATEGORIES = {
  EDUCATION: 'education',
  TECHNICAL: 'technical',
  EXPERIENCE: 'experience',
  BEHAVIORAL: 'behavioral',
  PROJECT: 'project'
};

const getQuestionCategory = (question) => {
  const q = question.toLowerCase();
  if (q.includes('education') || q.includes('degree') || q.includes('college') || q.includes('university')) {
    return QUESTION_CATEGORIES.EDUCATION;
  }
  if (q.includes('project') || q.includes('develop') || q.includes('implement') || q.includes('build')) {
    return QUESTION_CATEGORIES.PROJECT;
  }
  if (q.includes('experience') || q.includes('work') || q.includes('job') || q.includes('role')) {
    return QUESTION_CATEGORIES.EXPERIENCE;
  }
  if (q.includes('how do you') || q.includes('what would you') || q.includes('tell me about a time') || q.includes('handle')) {
    return QUESTION_CATEGORIES.BEHAVIORAL;
  }
  return QUESTION_CATEGORIES.TECHNICAL;
};

const generateFeedback = (question, answer, category) => {
  const answerLength = answer.length;
  const words = answer.split(' ').length;
  const sentences = answer.split(/[.!?]+/).filter(Boolean).length;
  const hasNumbers = /\d/.test(answer);
  const hasTechnicalTerms = /(algorithm|database|programming|software|development|code|api|framework|technology)/i.test(answer);
  const hasActionVerbs = /(developed|implemented|created|managed|led|achieved|improved|reduced|increased)/i.test(answer);
  const hasSpecificExamples = answer.includes('example') || answer.includes('instance') || answer.includes('such as');
  const questionKeywords = question.toLowerCase().split(' ').filter(word => word.length > 4);
  const keywordMatches = questionKeywords.filter(keyword => answer.toLowerCase().includes(keyword)).length;
  const keywordScore = keywordMatches / questionKeywords.length;

  // Base scores calculation
  let clarity = Math.min(Math.max(words / 20, 1), 10); // Longer answers tend to be clearer
  let relevance = Math.min((keywordScore * 10) + (hasSpecificExamples ? 2 : 0), 10);
  let communication = Math.min((sentences / 3) * 10, 10); // Good communication has multiple sentences
  let confidence = Math.min(Math.max(words / 15, 1), 10);
  let structure = Math.min((sentences > 1 ? 5 : 3) + (hasActionVerbs ? 2 : 0) + (hasSpecificExamples ? 3 : 0), 10);

  // Category-specific adjustments
  switch (category) {
    case QUESTION_CATEGORIES.TECHNICAL:
      relevance = hasTechnicalTerms ? Math.min(relevance + 2, 10) : Math.max(relevance - 2, 1);
      break;
    case QUESTION_CATEGORIES.PROJECT:
      structure = hasActionVerbs ? Math.min(structure + 2, 10) : Math.max(structure - 1, 1);
      relevance = hasNumbers ? Math.min(relevance + 1, 10) : relevance;
      break;
    case QUESTION_CATEGORIES.EXPERIENCE:
      relevance = hasSpecificExamples ? Math.min(relevance + 2, 10) : Math.max(relevance - 1, 1);
      break;
    case QUESTION_CATEGORIES.BEHAVIORAL:
      structure = answer.toLowerCase().includes('situation') ? Math.min(structure + 2, 10) : structure;
      break;
  }

  // Generate appropriate suggestions and improvements
  let suggestion, improvements, exampleAnswer;
  
  if (category === QUESTION_CATEGORIES.EDUCATION) {
    suggestion = words < 50 
      ? "Add more details about your academic achievements, relevant coursework, and technical skills gained during your education."
      : "Good overview of your education. Consider highlighting more specific academic projects or achievements.";
    improvements = hasSpecificExamples 
      ? "Include specific grades, awards, or recognition received during your education."
      : "Use the STAR method to describe a significant academic project or achievement.";
    exampleAnswer = "I earned my B.Tech in Information Technology with a 3.8 GPA, specializing in AI and Machine Learning. During my studies, I completed advanced coursework in data structures, algorithms, and software engineering. I led a team of 4 students in developing a machine learning-based sentiment analysis system, which won first place in our department's project showcase. Additionally, I participated in multiple hackathons and published a research paper on NLP techniques in the college journal.";
  } else if (category === QUESTION_CATEGORIES.TECHNICAL) {
    suggestion = hasTechnicalTerms 
      ? "Good use of technical terms. Consider adding more specific examples of implementation details."
      : "Include more technical details and specific technologies you've worked with.";
    improvements = hasSpecificExamples
      ? "Quantify your technical achievements with metrics or performance improvements."
      : "Provide concrete examples of how you've applied these technical skills in real projects.";
    exampleAnswer = "I have extensive experience with Python and its data science ecosystem (NumPy, Pandas, Scikit-learn). I implemented a fraud detection system using machine learning algorithms that achieved 95% accuracy and reduced false positives by 60%. The system processed over 1 million transactions daily using optimized SQL queries and Redis caching, resulting in sub-second response times.";
  } else if (category === QUESTION_CATEGORIES.PROJECT) {
    suggestion = hasActionVerbs
      ? "Good use of action verbs. Consider adding more metrics and results."
      : "Use more action verbs and describe your specific role in the project.";
    improvements = hasNumbers
      ? "Break down the project implementation into key phases or challenges overcome."
      : "Add specific metrics, timelines, and quantifiable results from the project.";
    exampleAnswer = "I led a team of 5 developers in creating a customer portal chat system with automated responses. Using Python and NLP techniques, we achieved 80% accurate response rate for common queries. The system reduced customer service response time by 65% and handled 500+ daily interactions. I implemented the core NLP algorithm and designed the scalable architecture using microservices.";
  } else if (category === QUESTION_CATEGORIES.EXPERIENCE) {
    suggestion = hasSpecificExamples
      ? "Good use of examples. Consider highlighting more achievements and metrics."
      : "Include specific examples of your responsibilities and achievements.";
    improvements = hasActionVerbs
      ? "Add more context about the impact of your work on the organization."
      : "Use strong action verbs and quantify your achievements with metrics.";
    exampleAnswer = "During my 2-year tenure at XYZ Corp, I managed a team of 3 developers and led the development of 5 major features for our e-commerce platform. I implemented an automated testing framework that reduced QA time by 40% and improved code coverage to 85%. My team's work resulted in a 25% increase in user engagement and a 30% reduction in cart abandonment rate.";
  } else {
    suggestion = sentences > 2
      ? "Good structured response. Consider adding more specific examples."
      : "Structure your answer using the STAR method with specific examples.";
    improvements = hasActionVerbs
      ? "Include more details about the outcomes and lessons learned."
      : "Use the STAR method: Situation, Task, Action, Result.";
    exampleAnswer = "When faced with a tight deadline for a critical project, I first assessed the situation by breaking down the requirements and identifying the core deliverables. I then prioritized tasks and reorganized my team of 4 developers to focus on the most important features. Through daily stand-ups and efficient task management, we completed the project 2 days ahead of schedule while maintaining our quality standards. This experience taught me valuable lessons about prioritization and team coordination.";
  }

  return {
    scores: {
      clarity_score: clarity.toFixed(0),
      relevance_score: relevance.toFixed(0),
      communication: communication.toFixed(0),
      confidence: confidence.toFixed(0),
      structure: structure.toFixed(0)
    },
    feedback: {
      suggestion,
      improvements,
      example_answer: exampleAnswer
    }
  };
};

const FeedbackPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [evaluationResults, setEvaluationResults] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedPanel, setExpandedPanel] = useState(false);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedPanel(isExpanded ? panel : false);
  };

  useEffect(() => {
    const evaluateAnswers = async () => {
      try {
        const interviewData = location.state?.interviewData;
        if (!interviewData) {
          setError('No interview data found. Please start a new interview.');
          setIsLoading(false);
          return;
        }

        // Ensure we have exactly 10 questions
        if (interviewData.length !== 10) {
          setError('Invalid number of questions. Expected 10 questions.');
          setIsLoading(false);
          return;
        }

        console.log('Evaluating interview data:', interviewData);

        const evaluatedResults = interviewData.map(item => {
          const category = getQuestionCategory(item.question);
          const evaluation = generateFeedback(item.question, item.answer, category);
          
          return {
            question: item.question,
            answer: item.answer,
            ...evaluation.scores,
            ...evaluation.feedback
          };
        });

        setEvaluationResults({ results: evaluatedResults });
      } catch (error) {
        console.error('Evaluation error:', error);
        setError(error.message || 'Failed to evaluate answers');
      } finally {
        setIsLoading(false);
      }
    };

    evaluateAnswers();
  }, [location.state]);

  const calculateDetailedScores = (results) => {
    if (!results || results.length === 0) return null;
    
    const totalScores = {
      clarity: 0,
      relevance: 0,
      communication: 0,
      confidence: 0,
      structure: 0
    };

    results.forEach(result => {
      totalScores.clarity += parseFloat(result.clarity_score);
      totalScores.relevance += parseFloat(result.relevance_score);
      totalScores.communication += parseFloat(result.communication);
      totalScores.confidence += parseFloat(result.confidence);
      totalScores.structure += parseFloat(result.structure);
    });

    const averageScores = {
      clarity: (totalScores.clarity / results.length).toFixed(1),
      relevance: (totalScores.relevance / results.length).toFixed(1),
      communication: (totalScores.communication / results.length).toFixed(1),
      confidence: (totalScores.confidence / results.length).toFixed(1),
      structure: (totalScores.structure / results.length).toFixed(1)
    };

    const overallScore = (
      (parseFloat(averageScores.clarity) +
      parseFloat(averageScores.relevance) +
      parseFloat(averageScores.communication) +
      parseFloat(averageScores.confidence) +
      parseFloat(averageScores.structure)) / 5
    ).toFixed(1);

    return { ...averageScores, overall: overallScore };
  };

  const getScoreColor = (score) => {
    const numScore = parseFloat(score);
    if (numScore < 4) return '#f44336';
    if (numScore < 7) return '#ff9800';
    return '#4caf50';
  };

  const renderScoreBar = (score, label) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body2" sx={{ mb: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {label}
        <Chip 
          label={`${score}/10`}
          size="small"
          sx={{ 
            backgroundColor: getScoreColor(score),
            color: 'white',
            fontWeight: 'bold'
          }}
        />
      </Typography>
      <LinearProgress
        variant="determinate"
        value={parseFloat(score) * 10}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: '#e0e0e0',
          '& .MuiLinearProgress-bar': {
            backgroundColor: getScoreColor(score)
          }
        }}
      />
    </Box>
  );

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 3 }}>Analyzing your interview...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button variant="contained" onClick={() => navigate('/')}>
          Start New Interview
        </Button>
      </Container>
    );
  }

  if (!evaluationResults || !evaluationResults.results) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">No evaluation results available.</Alert>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/')}>
          Start New Interview
        </Button>
      </Container>
    );
  }

  const scores = calculateDetailedScores(evaluationResults.results);

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
          Interview Evaluation Results
        </Typography>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            Overall Score: 
            <Chip 
              label={`${scores.overall}/10`}
              size="large"
              sx={{ 
                backgroundColor: getScoreColor(scores.overall),
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.2rem',
                padding: '20px 10px'
              }}
            />
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            {renderScoreBar(scores.clarity, "Overall Clarity")}
            {renderScoreBar(scores.communication, "Overall Communication")}
            {renderScoreBar(scores.confidence, "Overall Confidence")}
          </Grid>
          <Grid item xs={12} md={6}>
            {renderScoreBar(scores.relevance, "Overall Relevance")}
            {renderScoreBar(scores.structure, "Overall Structure")}
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h5" gutterBottom>
        Question Analysis
      </Typography>

      {evaluationResults.results.map((result, index) => (
        <Accordion 
          key={index}
          expanded={expandedPanel === `panel${index}`}
          onChange={handleAccordionChange(`panel${index}`)}
          sx={{ mb: 2 }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{ 
              '& .MuiAccordionSummary-content': { 
                display: 'flex', 
                flexDirection: 'column',
                gap: 1
              }
            }}
          >
            <Typography variant="subtitle1" color="primary">
              Question {index + 1}: {result.question}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {[
                { label: 'Clarity', value: result.clarity_score },
                { label: 'Relevance', value: result.relevance_score },
                { label: 'Communication', value: result.communication },
                { label: 'Confidence', value: result.confidence },
                { label: 'Structure', value: result.structure }
              ].map(({ label, value }) => (
                <Chip
                  key={label}
                  label={`${label}: ${value}/10`}
                  size="small"
                  sx={{
                    backgroundColor: getScoreColor(value),
                    color: 'white'
                  }}
                />
              ))}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Your Answer:
              </Typography>
              <Typography variant="body1" sx={{ ml: 2, mb: 3 }}>
                {result.answer}
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  {renderScoreBar(result.clarity_score, "Clarity")}
                  {renderScoreBar(result.communication, "Communication")}
                  {renderScoreBar(result.confidence, "Confidence")}
                </Grid>
                <Grid item xs={12} md={6}>
                  {renderScoreBar(result.relevance_score, "Relevance")}
                  {renderScoreBar(result.structure, "Structure")}
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" color="primary">
                  💡 Suggestion:
                </Typography>
                <Typography variant="body1" sx={{ ml: 2 }}>
                  {result.suggestion || "No suggestions available."}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" color="primary">
                  🔧 Areas for Improvement:
                </Typography>
                <Typography variant="body1" sx={{ ml: 2 }}>
                  {result.improvements || "No improvements suggested."}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle1" color="primary">
                  ✅ Example Answer:
                </Typography>
                <Typography variant="body1" sx={{ ml: 2 }}>
                  {result.example_answer || "No example answer available."}
                </Typography>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/')}
          sx={{ minWidth: 200 }}
        >
          Start New Interview
        </Button>
      </Box>
    </Container>
  );
};

export default FeedbackPage;
