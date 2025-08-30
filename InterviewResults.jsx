import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Paper,
  Divider,
  Button,
  Avatar,
  IconButton,
  Tooltip,
  Container
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const InterviewResults = ({ results, onBackToHome }) => {
  const [expandedQuestions, setExpandedQuestions] = React.useState({});
  
  console.log('InterviewResults received:', results);
  
  // Handle both old format (array) and new format (object with evaluations and overallSuggestion)
  const isNewFormat = results && typeof results === 'object' && results.evaluations;
  
  if (!results || (isNewFormat ? results.evaluations.length === 0 : results.length === 0)) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
            No evaluation results available
          </Typography>
          <Button
            variant="outlined"
            onClick={onBackToHome}
            startIcon={<ArrowBackIcon />}
          >
            Back to Home
          </Button>
        </Box>
      </Container>
    );
  }

  // Extract data based on format
  const evaluations = isNewFormat ? results.evaluations : results;
  const overallSuggestion = isNewFormat ? results.overallSuggestion : '';

  // Calculate overall score from individual question evaluations
  const calculateOverallScore = () => {
    if (!Array.isArray(evaluations)) return 0;
    
    const totalScore = evaluations.reduce((sum, result) => {
      const evaluation = result.evaluation;
      // Calculate average of all individual scores
      const clarity = evaluation?.clarity_score || 0;
      const relevance = evaluation?.relevance_score || 0;
      const communication = evaluation?.communication || 0;
      const confidence = evaluation?.confidence || 0;
      const structure = evaluation?.structure || 0;
      
      const avgScore = (clarity + relevance + communication + confidence + structure) / 5;
      return sum + avgScore;
    }, 0);
    
    return evaluations.length > 0 ? totalScore / evaluations.length : 0;
  };

  const overallScore = calculateOverallScore();
  const detailedResults = evaluations;
  
  console.log('Processed data:', {
    overallScore,
    detailedResults
  });

  const getScoreColor = (score) => {
    if (score >= 8) return '#10b981'; // Green
    if (score >= 6) return '#f59e0b'; // Amber
    if (score >= 4) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  const getScoreLabel = (score) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Fair';
    return 'Needs Improvement';
  };

  // Prepare data for charts
  const prepareChartData = () => {
    const categoryScores = {
      clarity: 0,
      relevance: 0,
      communication: 0,
      confidence: 0,
      structure: 0
    };

    let totalQuestions = 0;

    evaluations.forEach(result => {
      const evaluation = result.evaluation || {};
      if (evaluation.clarity_score) {
        categoryScores.clarity += evaluation.clarity_score;
        categoryScores.relevance += evaluation.relevance_score || 0;
        categoryScores.communication += evaluation.communication || 0;
        categoryScores.confidence += evaluation.confidence || 0;
        categoryScores.structure += evaluation.structure || 0;
        totalQuestions++;
      }
    });

    if (totalQuestions > 0) {
      Object.keys(categoryScores).forEach(key => {
        categoryScores[key] = categoryScores[key] / totalQuestions;
      });
    }

    return [
      { name: 'Clarity', value: categoryScores.clarity, fill: '#3b82f6' },
      { name: 'Relevance', value: categoryScores.relevance, fill: '#10b981' },
      { name: 'Communication', value: categoryScores.communication, fill: '#f59e0b' },
      { name: 'Confidence', value: categoryScores.confidence, fill: '#8b5cf6' },
      { name: 'Structure', value: categoryScores.structure, fill: '#ef4444' }
    ];
  };

  const prepareQuestionChartData = () => {
    return evaluations.map((result, index) => {
      const evaluation = result.evaluation || {};
      const clarity = evaluation?.clarity_score || 0;
      const relevance = evaluation?.relevance_score || 0;
      const communication = evaluation?.communication || 0;
      const confidence = evaluation?.confidence || 0;
      const structure = evaluation?.structure || 0;
      const avgScore = (clarity + relevance + communication + confidence + structure) / 5;
      
      return {
        question: `Q${index + 1}`,
        score: avgScore,
        clarity,
        relevance,
        communication,
        confidence,
        structure
      };
    });
  };

  const chartData = prepareChartData();
  const questionChartData = prepareQuestionChartData();

  const toggleQuestionExpansion = (questionIndex) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionIndex]: !prev[questionIndex]
    }));
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box sx={{
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: 2,
          p: 2,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            {label}
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280' }}>
            Score: {payload[0].value.toFixed(1)}/10
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      py: 4
    }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            mb: 3
          }}>
            <Button
              variant="outlined"
              onClick={onBackToHome}
              startIcon={<ArrowBackIcon />}
              sx={{ 
                borderColor: '#d1d5db',
                color: '#374151',
                '&:hover': {
                  borderColor: '#9ca3af',
                  backgroundColor: '#f9fafb'
                }
              }}
            >
              Back to Home
            </Button>
          </Box>
          
          <Typography variant="h3" sx={{ 
            fontWeight: 700, 
            color: '#111827',
            mb: 1,
            textAlign: 'center'
          }}>
            Interview Results
          </Typography>
          
          <Typography variant="body1" sx={{ 
            color: '#6b7280',
            fontSize: '1.125rem',
            textAlign: 'center'
          }}>
            Detailed analysis of your interview performance
          </Typography>
        </Box>

        {/* Overall Score Card */}
        <Card sx={{ 
          mb: 4,
          backgroundColor: 'white',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          borderRadius: 2
        }}>
          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar sx={{ 
                    width: 120, 
                    height: 120, 
                    mx: 'auto', 
                    mb: 3,
                    backgroundColor: getScoreColor(overallScore),
                    fontSize: '2.5rem',
                    fontWeight: 700
                  }}>
                    {overallScore.toFixed(1)}
                  </Avatar>
                  
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    color: '#111827',
                    mb: 1
                  }}>
                    {overallScore.toFixed(1)}/10
                  </Typography>
                  
                  <Typography variant="body1" sx={{ 
                    color: '#6b7280',
                    mb: 2
                  }}>
                    Overall Score
                  </Typography>
                  
                  <Chip
                    label={getScoreLabel(overallScore)}
                    sx={{
                      backgroundColor: getScoreColor(overallScore),
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      px: 2,
                      py: 1
                    }}
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12} md={8}>
                <Typography variant="h5" sx={{ 
                  fontWeight: 600, 
                  mb: 3,
                  color: '#111827'
                }}>
                  Performance Overview
                </Typography>
                
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      Overall Progress
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {Math.round(overallScore * 10)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={overallScore * 10}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#e5e7eb',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getScoreColor(overallScore),
                        borderRadius: 4,
                      }
                    }}
                  />
                </Box>
                
                <Grid container spacing={3}>
                  {chartData.map((item, index) => (
                    <Grid item xs={6} sm={4} key={index}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ 
                          color: item.fill,
                          fontWeight: 700,
                          mb: 1
                        }}>
                          {item.value.toFixed(1)}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: '#6b7280',
                          fontWeight: 500
                        }}>
                          {item.name}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Charts Section */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {/* Performance by Category */}
          <Grid item xs={12} lg={6}>
            <Card sx={{ 
              height: '100%',
              backgroundColor: 'white',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              borderRadius: 2
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  mb: 3,
                  color: '#111827',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <AssessmentIcon sx={{ mr: 1.5, color: '#3b82f6' }} />
                  Performance by Category
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis 
                      domain={[0, 10]} 
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Question Performance Trend */}
          <Grid item xs={12} lg={6}>
            <Card sx={{ 
              height: '100%',
              backgroundColor: 'white',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              borderRadius: 2
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  mb: 3,
                  color: '#111827',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <TrendingUpIcon sx={{ mr: 1.5, color: '#10b981' }} />
                  Question Performance Trend
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={questionChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis 
                      dataKey="question" 
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis 
                      domain={[0, 10]} 
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Overall Suggestion */}
        {overallSuggestion && (
          <Card sx={{ 
            mb: 6,
            backgroundColor: 'white',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            borderRadius: 2
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" sx={{ 
                fontWeight: 600, 
                mb: 3,
                color: '#111827'
              }}>
                Overall Assessment
              </Typography>
              
              <Box sx={{ 
                backgroundColor: '#f8fafc',
                borderRadius: 2,
                p: 3,
                border: '1px solid #e5e7eb'
              }}>
                <Typography variant="body1" sx={{ 
                  color: '#374151',
                  lineHeight: 1.7,
                  fontSize: '1rem'
                }}>
                  {overallSuggestion}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Question-by-Question Analysis */}
        <Card sx={{ 
          backgroundColor: 'white',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          borderRadius: 2
        }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 600, 
              mb: 4,
              color: '#111827'
            }}>
              Question-by-Question Analysis
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {detailedResults.map((result, index) => {
                const evaluation = result.evaluation || {};
                const clarity = evaluation?.clarity_score || 0;
                const relevance = evaluation?.relevance_score || 0;
                const communication = evaluation?.communication || 0;
                const confidence = evaluation?.confidence || 0;
                const structure = evaluation?.structure || 0;
                const avgScore = (clarity + relevance + communication + confidence + structure) / 5;
                const isExpanded = expandedQuestions[index];

                return (
                  <Card key={index} sx={{ 
                    border: '1px solid #e5e7eb',
                    borderRadius: 2,
                    overflow: 'hidden'
                  }}>
                    <Box sx={{ 
                      p: 3,
                      backgroundColor: '#f9fafb',
                      borderBottom: isExpanded ? '1px solid #e5e7eb' : 'none'
                    }}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            backgroundColor: getScoreColor(avgScore),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.875rem'
                          }}>
                            {index + 1}
                          </Box>
                          
                          <Typography variant="h6" sx={{ 
                            fontWeight: 600,
                            color: '#111827'
                          }}>
                            Question {index + 1}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Chip
                            label={`${avgScore.toFixed(1)}/10`}
                            sx={{
                              backgroundColor: getScoreColor(avgScore),
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.875rem'
                            }}
                          />
                          
                          <IconButton
                            onClick={() => toggleQuestionExpansion(index)}
                            sx={{ 
                              color: '#6b7280',
                              '&:hover': { backgroundColor: '#f3f4f6' }
                            }}
                          >
                            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        </Box>
                      </Box>
                      
                      <Typography variant="body1" sx={{ 
                        color: '#374151',
                        mt: 2,
                        lineHeight: 1.6
                      }}>
                        {result.question}
                      </Typography>
                    </Box>
                    
                    {isExpanded && (
                      <Box sx={{ p: 3 }}>
                        <Typography variant="body2" sx={{ 
                          color: '#6b7280',
                          mb: 2,
                          fontStyle: 'italic'
                        }}>
                          Your Answer: {result.answer}
                        </Typography>
                        
                        <Divider sx={{ my: 3 }} />
                        
                        {/* Individual Scores */}
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                          <Grid item xs={6} sm={4}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h6" sx={{ 
                                color: '#3b82f6',
                                fontWeight: 600
                              }}>
                                {clarity.toFixed(1)}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#6b7280' }}>
                                Clarity
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={4}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h6" sx={{ 
                                color: '#10b981',
                                fontWeight: 600
                              }}>
                                {relevance.toFixed(1)}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#6b7280' }}>
                                Relevance
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={4}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h6" sx={{ 
                                color: '#f59e0b',
                                fontWeight: 600
                              }}>
                                {communication.toFixed(1)}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#6b7280' }}>
                                Communication
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={4}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h6" sx={{ 
                                color: '#8b5cf6',
                                fontWeight: 600
                              }}>
                                {confidence.toFixed(1)}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#6b7280' }}>
                                Confidence
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={4}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h6" sx={{ 
                                color: '#ef4444',
                                fontWeight: 600
                              }}>
                                {structure.toFixed(1)}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#6b7280' }}>
                                Structure
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                        
                        {/* Feedback */}
                        {evaluation.suggestion && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" sx={{ 
                              fontWeight: 600,
                              color: '#111827',
                              mb: 1
                            }}>
                              Suggestions
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              color: '#374151',
                              lineHeight: 1.6
                            }}>
                              {evaluation.suggestion}
                            </Typography>
                          </Box>
                        )}
                        
                        {evaluation.improvements && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" sx={{ 
                              fontWeight: 600,
                              color: '#111827',
                              mb: 1
                            }}>
                              Areas for Improvement
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              color: '#374151',
                              lineHeight: 1.6
                            }}>
                              {evaluation.improvements}
                            </Typography>
                          </Box>
                        )}
                        
                        {evaluation.example_answer && (
                          <Box>
                            <Typography variant="subtitle2" sx={{ 
                              fontWeight: 600,
                              color: '#111827',
                              mb: 1
                            }}>
                              Example Answer
                            </Typography>
                            <Box sx={{ 
                              backgroundColor: '#f8fafc',
                              borderRadius: 2,
                              p: 2,
                              border: '1px solid #e5e7eb'
                            }}>
                              <Typography variant="body2" sx={{ 
                                color: '#374151',
                                lineHeight: 1.6,
                                fontStyle: 'italic'
                              }}>
                                {evaluation.example_answer}
                              </Typography>
                            </Box>
                          </Box>
                        )}
                      </Box>
                    )}
                  </Card>
                );
              })}
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default InterviewResults;
