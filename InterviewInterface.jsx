import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Box, Typography, Button, TextField, Card, CardContent,
  CircularProgress, Alert, IconButton, Paper, Tooltip, LinearProgress
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { interviewEvaluationAPI, transcriptionAPI, evaluationAPI, overallSuggestionAPI, handleAPIError } from '../../utils/api';

const InterviewInterface = ({ 
  questions, 
  onComplete, 
  onExit,
  error,
  setError 
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [answer, setAnswer] = useState('');
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [interviewData, setInterviewData] = useState([]);
  const [isCameraAvailable, setIsCameraAvailable] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState('');
  const [evaluationResults, setEvaluationResults] = useState([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationError, setEvaluationError] = useState('');
  const [overallSuggestion, setOverallSuggestion] = useState('');
  const [isGettingOverallSuggestion, setIsGettingOverallSuggestion] = useState(false);
  const [isRecordingDisabled, setIsRecordingDisabled] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  const recognitionRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const isRecordingRef = useRef(false);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);


  // Convert audio blob to WAV format (simplified)
  const convertToWav = async (audioBlob) => {
    console.log('Audio blob ready for transcription:', audioBlob.size, 'bytes');
    return audioBlob;
  };



  // Initialize speech recognition
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';
    
    recognitionRef.current.onresult = (event) => {
      if (isRecordingRef.current) {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join(' ');
        setAnswer(transcript);
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      
      if (event.error === 'no-speech' || event.error === 'aborted') {
        return;
      }
      
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone access to use speech recognition.');
        isRecordingRef.current = false;
        setIsRecording(false);
      } else if (event.error === 'service-not-allowed') {
        setError('Speech recognition service not allowed. Please check your browser settings.');
        isRecordingRef.current = false;
        setIsRecording(false);
      } else if (event.error === 'network' || event.error === 'audio-capture') {
        console.warn('Speech recognition warning:', event.error);
      } else {
        console.warn('Speech recognition warning:', event.error);
      }
    };

    recognitionRef.current.onend = () => {
      if (isRecordingRef.current && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (error) {
          console.error('Failed to restart speech recognition:', error);
          isRecordingRef.current = false;
          setIsRecording(false);
          setError('Failed to restart recording. Please try again.');
        }
      }
    };

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          recognitionRef.current.abort();
        } catch (error) {
          console.error('Error stopping recognition on cleanup:', error);
        }
        recognitionRef.current = null;
      }
      stopCamera();
    };
  }, [setError]);

  const [isCameraOn, setIsCameraOn] = useState(false);

  useEffect(() => {
    if (isCameraOn && !isCameraAvailable && streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      if (videoTracks.length > 0 && videoTracks[0].readyState === 'live') {
        setIsCameraAvailable(true);
      }
    }
  }, [isCameraOn, isCameraAvailable]);

  useEffect(() => {
    if (isCameraOn && isCameraAvailable && streamRef.current && videoRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      if (videoTracks.length > 0 && videoTracks[0].readyState === 'live') {
        if (videoRef.current.srcObject !== streamRef.current) {
          videoRef.current.srcObject = streamRef.current;
          videoRef.current.load();
        }
        
        if (videoRef.current.paused) {
          videoRef.current.play().catch(console.error);
        }
      }
    }
  }, [isCameraOn, isCameraAvailable]);

  const startCamera = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      setIsCameraAvailable(false);

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          }, 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
      } catch (videoError) {
        console.warn('Video+Audio failed, trying video only:', videoError);
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          }
        });
      }
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.load();
        
        videoRef.current.onloadedmetadata = () => setIsCameraAvailable(true);
        videoRef.current.oncanplay = () => setIsCameraAvailable(true);
        videoRef.current.onplaying = () => setIsCameraAvailable(true);
        videoRef.current.onerror = (error) => {
          console.error('Video error:', error);
          setIsCameraAvailable(false);
        };
        
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        videoRef.current.autoplay = true;
        
        try {
          await videoRef.current.play();
          setIsCameraAvailable(true);
        } catch (playError) {
          console.error('Video play error:', playError);
          if (stream && stream.getVideoTracks().length > 0) {
            setIsCameraAvailable(true);
          }
        }
        
        if (stream && stream.getVideoTracks().length > 0) {
          setIsCameraAvailable(true);
        }
        
        setTimeout(() => {
          if (stream && stream.getVideoTracks().length > 0) {
            setIsCameraAvailable(true);
          }
        }, 500);
      }
      
      return stream;
    } catch (err) {
      console.error('Camera/mic error:', err);
      setError('Camera access denied. Please allow camera and microphone access.');
      setIsCameraAvailable(false);
      throw err;
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
    setIsCameraAvailable(false);
  };

  const stopRecording = useCallback(async () => {
    console.log('Stopping recording...');
    
    if (recognitionRef.current) {
      isRecordingRef.current = false;
      setIsRecording(false);
      try {
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
      recognitionRef.current = null;
    }
    
    setIsRecordingDisabled(true);
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      return new Promise((resolve) => {
        mediaRecorderRef.current.onstop = async () => {
          console.log('Media recording stopped, processing recorded data...');
          
          try {
            const mimeType = mediaRecorderRef.current.mimeType;
            const recordedBlob = new Blob(recordedChunksRef.current, { type: mimeType });
            console.log('Audio blob created:', recordedBlob.size, 'bytes, type:', mimeType);
            
            const audioBlob = await convertToWav(recordedBlob);
            
            setIsTranscribing(true);
            setTranscriptionError('');
            
            const response = await transcriptionAPI.transcribe(audioBlob);
            
            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              console.error('Transcription API error:', errorData);
              
              if (errorData.detail && Array.isArray(errorData.detail)) {
                const errorMessages = errorData.detail.map(err => `${err.loc?.join('.')}: ${err.msg}`).join(', ');
                throw new Error(`Transcription failed: ${errorMessages}`);
              } else if (errorData.detail) {
                throw new Error(`Transcription failed: ${errorData.detail}`);
              } else {
                throw new Error(`Transcription failed: HTTP ${response.status}`);
              }
            }
            
            const transcriptionData = await response.json();
            console.log('Transcription result:', transcriptionData);
            
            if (transcriptionData.text) {
              setAnswer(transcriptionData.text);
            }
            
            setIsTranscribing(false);
          } catch (error) {
            console.error('Transcription error:', error);
            setTranscriptionError(`Transcription failed: ${handleAPIError(error, 'Transcription')}`);
            setIsTranscribing(false);
          }
          
          if (isCameraOn) {
            stopCamera();
            setIsCameraOn(false);
          }
          
          resolve();
        };
        
        mediaRecorderRef.current.stop();
      });
    } else {
      if (isCameraOn) {
        stopCamera();
        setIsCameraOn(false);
      }
    }
  }, [isCameraOn]);

  const startRecording = useCallback(() => {
    setError('');
    setTranscriptionError('');
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';
    
    isRecordingRef.current = true;
    setIsRecording(true);
    
    recordedChunksRef.current = [];
    
    recognitionRef.current.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join(' ');
      setAnswer(transcript);
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      
      if (event.error === 'no-speech' || event.error === 'aborted') {
        return;
      }
      
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone access to use speech recognition.');
        isRecordingRef.current = false;
        setIsRecording(false);
      } else if (event.error === 'service-not-allowed') {
        setError('Speech recognition service not allowed. Please check your browser settings.');
        isRecordingRef.current = false;
        setIsRecording(false);
      } else if (event.error === 'network' || event.error === 'audio-capture') {
        console.warn('Speech recognition warning:', event.error);
      } else {
        console.warn('Speech recognition warning:', event.error);
      }
    };

    recognitionRef.current.onend = () => {
      if (isRecordingRef.current && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (error) {
          console.error('Failed to restart speech recognition:', error);
          isRecordingRef.current = false;
          setIsRecording(false);
          setError('Failed to restart recording. Please try again.');
        }
      } else {
        isRecordingRef.current = false;
        setIsRecording(false);
      }
    };

    console.log('Starting camera and recording...');
    startCamera()
      .then((stream) => {
        console.log('Camera started successfully:', stream);
        setIsCameraOn(true);
        
        try {
          const audioStream = new MediaStream();
          stream.getAudioTracks().forEach(track => {
            audioStream.addTrack(track);
          });
          
          const mimeTypes = [
            'audio/wav',
            'audio/mp3',
            'audio/mp4',
            'audio/webm;codecs=opus',
            'audio/webm'
          ];
          
          let selectedMimeType = null;
          for (const mimeType of mimeTypes) {
            if (MediaRecorder.isTypeSupported(mimeType)) {
              selectedMimeType = mimeType;
              break;
            }
          }
          
          if (!selectedMimeType) {
            throw new Error('No supported audio format found');
          }
          
          console.log('Using audio format:', selectedMimeType);
          
          mediaRecorderRef.current = new MediaRecorder(audioStream, {
            mimeType: selectedMimeType
          });
          
          mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
              recordedChunksRef.current.push(event.data);
            }
          };
          
          mediaRecorderRef.current.start();
          console.log('Audio recording started');
        } catch (error) {
          console.error('Failed to start audio recording:', error);
        }
        
        setTimeout(() => {
          if (stream && stream.getVideoTracks().length > 0) {
            setIsCameraAvailable(true);
          }
        }, 200);
        
        recognitionRef.current.start();
        setIsRecording(true);
        setError('');
      })
      .catch((error) => {
        console.error('Failed to start camera or recording:', error);
        setError('Failed to start recording. Please check your camera and microphone permissions.');
      });
  }, [setError]);

  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, stopRecording, startRecording]);

  const handleNextQuestion = useCallback(async () => {
    console.log('handleNextQuestion called - processing current question and moving to next');
    console.log('Questions array length:', questions.length);
    console.log('Current question index:', currentQuestionIndex);
    const cleanAnswer = answer.trim();
    
    if (!cleanAnswer) {
      setError('Please provide an answer before proceeding.');
      return;
    }

    if (cleanAnswer.length < 20) {
      setError('Please provide a more detailed answer (at least 20 characters).');
      return;
    }

    if (!questions[currentQuestionIndex]) {
      setError('Question not found. Please start a new interview.');
      return;
    }

    setIsLoadingFeedback(true);
    setError('');

    try {
      console.log(`Evaluating question ${currentQuestionIndex + 1}...`);
      
      const evaluationData = {
        question: questions[currentQuestionIndex],
        answer: cleanAnswer
      };
      
      console.log('Sending to evaluation API:', evaluationData);
      
      const response = await evaluationAPI.evaluate(evaluationData);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Evaluation failed: ${response.status} - ${JSON.stringify(errorData)}`);
      }
      
      const evaluationResult = await response.json();
      console.log('Evaluation result for question', currentQuestionIndex + 1, ':', evaluationResult);
      
      const newEvaluationResult = {
        questionIndex: currentQuestionIndex,
        question: questions[currentQuestionIndex],
        answer: cleanAnswer,
        evaluation: evaluationResult
      };
      
      setEvaluationResults(prev => [...prev, newEvaluationResult]);
      
      const newAnswer = {
        question: questions[currentQuestionIndex],
        answer: cleanAnswer
      };

      const updatedInterviewData = [...interviewData, newAnswer];
      setInterviewData(updatedInterviewData);
      setAnswer('');

      // Check if this is the last question
      if (currentQuestionIndex === 9) {
        // This is the last question (question 10) - complete interview
        const finalResults = [...evaluationResults, newEvaluationResult];
        console.log('Interview completed on last question. All evaluations:', finalResults);
        
        const allSuggestions = finalResults
          .map(result => result.evaluation?.suggestion)
          .filter(suggestion => suggestion && suggestion.trim() !== '');
        
        if (allSuggestions.length > 0) {
          setIsGettingOverallSuggestion(true);
          try {
            const response = await overallSuggestionAPI.getOverallSuggestion(allSuggestions);
            
            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(`Overall suggestion failed: ${response.status} - ${JSON.stringify(errorData)}`);
            }
            
            const overallSuggestionData = await response.json();
            console.log('Overall suggestion result:', overallSuggestionData);
            
            setOverallSuggestion(overallSuggestionData.overall_suggestion || '');
            
            cleanupAndExit(() => onComplete({
              evaluations: finalResults,
              overallSuggestion: overallSuggestionData.overall_suggestion || ''
            }));
          } catch (error) {
            console.error('Overall suggestion error:', error);
            cleanupAndExit(() => onComplete({
              evaluations: finalResults,
              overallSuggestion: ''
            }));
          } finally {
            setIsGettingOverallSuggestion(false);
          }
        } else {
          cleanupAndExit(() => onComplete({
            evaluations: finalResults,
            overallSuggestion: ''
          }));
        }
      } else {
        // Move to next question (questions 1-9)
        console.log('Moving to next question from index:', currentQuestionIndex);
        setCurrentQuestionIndex(prev => prev + 1);
        setIsRecordingDisabled(false);
      }
    } catch (error) {
      console.error('Evaluation error:', error);
      setEvaluationError(`Failed to evaluate question: ${error.message}`);
      
      const newAnswer = {
        question: questions[currentQuestionIndex],
        answer: cleanAnswer
      };

      const updatedInterviewData = [...interviewData, newAnswer];
      setInterviewData(updatedInterviewData);
      setAnswer('');

      // In case of error, still move to next question if not the last one
      if (currentQuestionIndex < 9) {
        setCurrentQuestionIndex(prev => prev + 1);
        setIsRecordingDisabled(false);
      } else {
        cleanupAndExit(() => onComplete(updatedInterviewData));
      }
    } finally {
      setIsLoadingFeedback(false);
    }
  }, [answer, currentQuestionIndex, interviewData, questions, onComplete, setError, evaluationResults]);

  const cleanupAndExit = (callback) => {
    if (isRecording) {
      stopRecording();
    }
    
    stopCamera();
    callback();
  };

  const handleExit = () => {
    setShowExitDialog(true);
  };

  const confirmExit = () => {
    setShowExitDialog(false);
    cleanupAndExit(() => {
      onExit();
    });
  };

  const cancelExit = () => {
    setShowExitDialog(false);
  };

  const openSubmitDialog = () => {
    setShowSubmitDialog(true);
  };

  const confirmSubmit = async () => {
    setShowSubmitDialog(false);
    await handleSubmitInterview();
  };

  const handleSubmitInterview = async () => {
    console.log('handleSubmitInterview called - submitting interview early');
    
    // First, evaluate current question if there's an answer
    if (answer.trim() && answer.trim().length >= 20) {
      setIsLoadingFeedback(true);
      setError('');

      try {
        console.log(`Evaluating current question ${currentQuestionIndex + 1} before submission...`);
        
        const evaluationData = {
          question: questions[currentQuestionIndex],
          answer: answer.trim()
        };
        
        const response = await evaluationAPI.evaluate(evaluationData);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Evaluation failed: ${response.status} - ${JSON.stringify(errorData)}`);
        }
        
        const evaluationResult = await response.json();
        
        const newEvaluationResult = {
          questionIndex: currentQuestionIndex,
          question: questions[currentQuestionIndex],
          answer: answer.trim(),
          evaluation: evaluationResult
        };
        
        const finalResults = [...evaluationResults, newEvaluationResult];
        console.log('Interview submitted early. All evaluations:', finalResults);
        
        const allSuggestions = finalResults
          .map(result => result.evaluation?.suggestion)
          .filter(suggestion => suggestion && suggestion.trim() !== '');
        
        if (allSuggestions.length > 0) {
          setIsGettingOverallSuggestion(true);
          try {
            const response = await overallSuggestionAPI.getOverallSuggestion(allSuggestions);
            
            if (!response.ok) {
              throw new Error(`Overall suggestion failed: ${response.status}`);
            }
            
            const overallSuggestionData = await response.json();
            console.log('Overall suggestion result:', overallSuggestionData);
            
            cleanupAndExit(() => onComplete({
              evaluations: finalResults,
              overallSuggestion: overallSuggestionData.overall_suggestion || ''
            }));
          } catch (error) {
            console.error('Overall suggestion error:', error);
            cleanupAndExit(() => onComplete({
              evaluations: finalResults,
              overallSuggestion: ''
            }));
          } finally {
            setIsGettingOverallSuggestion(false);
          }
        } else {
          cleanupAndExit(() => onComplete({
            evaluations: finalResults,
            overallSuggestion: ''
          }));
        }
      } catch (error) {
        console.error('Evaluation error during submission:', error);
        setEvaluationError(`Failed to evaluate question: ${error.message}`);
        
        // Even if evaluation fails, complete with existing results
        const finalResults = [...evaluationResults];
        cleanupAndExit(() => onComplete({
          evaluations: finalResults,
          overallSuggestion: ''
        }));
      } finally {
        setIsLoadingFeedback(false);
      }
    } else {
      // No current answer to evaluate, complete with existing evaluations
      const finalResults = [...evaluationResults];
      console.log('Interview submitted early. All evaluations:', finalResults);
      
      const allSuggestions = finalResults
        .map(result => result.evaluation?.suggestion)
        .filter(suggestion => suggestion && suggestion.trim() !== '');
      
      if (allSuggestions.length > 0) {
        setIsGettingOverallSuggestion(true);
        try {
          const response = await overallSuggestionAPI.getOverallSuggestion(allSuggestions);
          
          if (!response.ok) {
            throw new Error(`Overall suggestion failed: ${response.status}`);
          }
          
          const overallSuggestionData = await response.json();
          console.log('Overall suggestion result:', overallSuggestionData);
          
          cleanupAndExit(() => onComplete({
            evaluations: finalResults,
            overallSuggestion: overallSuggestionData.overall_suggestion || ''
          }));
        } catch (error) {
          console.error('Overall suggestion error:', error);
          cleanupAndExit(() => onComplete({
            evaluations: finalResults,
            overallSuggestion: ''
          }));
        } finally {
          setIsGettingOverallSuggestion(false);
        }
      } else {
        cleanupAndExit(() => onComplete({
          evaluations: finalResults,
          overallSuggestion: ''
        }));
      }
    }
  };

  const cancelSubmit = () => {
    setShowSubmitDialog(false);
  };

  if (!questions || questions.length === 0) {
    return (
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <Paper sx={{ p: 6, textAlign: 'center', maxWidth: 500 }}>
          <Typography variant="h5" color="error" sx={{ fontWeight: 500 }}>
            No questions available
          </Typography>
          <Typography variant="body1" sx={{ mt: 2, color: '#64748b' }}>
            Please start a new interview session.
          </Typography>
        </Paper>
      </Box>
    );
  }

  const progressPercentage = ((currentQuestionIndex) / 10) * 100;

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#f8fafc',
      position: 'relative'
    }}>
      {/* Professional Header */}
      <Box sx={{ 
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        px: { xs: 3, md: 4 },
        py: 3,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          maxWidth: '1200px',
          mx: 'auto'
        }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              color: '#1e293b',
              fontSize: { xs: '1.1rem', md: '1.25rem' }
            }}>
              Interview Assessment
            </Typography>
            <Typography variant="body2" sx={{ 
              color: '#64748b', 
              mt: 0.5,
              fontSize: { xs: '0.875rem', md: '0.9rem' }
            }}>
              Question {currentQuestionIndex + 1} of 10
            </Typography>
            
            {/* Progress Bar */}
            <Box sx={{ mt: 2, maxWidth: 300 }}>
              <LinearProgress 
                variant="determinate" 
                value={progressPercentage} 
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: '#e2e8f0',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#3b82f6',
                    borderRadius: 3
                  }
                }}
              />
              <Typography variant="caption" sx={{ 
                color: '#64748b', 
                mt: 0.5,
                display: 'block'
              }}>
                {Math.round(progressPercentage)}% Complete
              </Typography>
            </Box>
          </Box>
          
          <Button
            variant="outlined"
            startIcon={<ExitToAppIcon />}
            onClick={handleExit}
            sx={{
              color: '#dc2626',
              borderColor: '#dc2626',
              '&:hover': {
                backgroundColor: '#dc2626',
                color: 'white',
                borderColor: '#dc2626'
              },
              fontWeight: 500,
              px: 3,
              py: 1
            }}
          >
            Exit
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Box sx={{
          position: 'fixed',
          top: 100,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1001,
          maxWidth: '90%',
          width: 'auto',
          minWidth: '300px'
        }}>
          <Alert 
            severity="error" 
            sx={{ 
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              borderRadius: 2
            }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        </Box>
      )}

      {/* Exit Confirmation Dialog */}
      {showExitDialog && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 1002,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Paper sx={{
            maxWidth: 450,
            width: '90%',
            mx: 2,
            p: 4,
            textAlign: 'center'
          }}>
            <Typography variant="h5" sx={{ 
              mb: 2, 
              color: '#dc2626',
              fontWeight: 600
            }}>
              Exit Interview?
            </Typography>
            
            <Typography variant="body1" sx={{ 
              mb: 3, 
              color: '#64748b',
              lineHeight: 1.6
            }}>
              Are you sure you want to exit the interview? Your progress will be lost and cannot be recovered.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                onClick={cancelExit}
                sx={{
                  px: 3,
                  py: 1.5,
                  borderColor: '#64748b',
                  color: '#64748b',
                  '&:hover': {
                    borderColor: '#475569',
                    backgroundColor: '#f8fafc'
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={confirmExit}
                sx={{
                  px: 3,
                  py: 1.5,
                  backgroundColor: '#dc2626',
                  '&:hover': {
                    backgroundColor: '#b91c1c'
                  }
                }}
              >
                Exit Interview
              </Button>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Submit Interview Confirmation Dialog */}
      {showSubmitDialog && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 1002,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Paper sx={{
            maxWidth: 500,
            width: '90%',
            mx: 2,
            p: 4,
            textAlign: 'center'
          }}>
            <Typography variant="h5" sx={{ 
              mb: 2, 
              color: '#f59e0b',
              fontWeight: 600
            }}>
              Submit Interview Early?
            </Typography>
            
            <Typography variant="body1" sx={{ 
              mb: 2, 
              color: '#64748b',
              lineHeight: 1.6
            }}>
              You have only attempted <strong>{evaluationResults.length + (answer.trim() && answer.trim().length >= 20 ? 1 : 0)} out of 10</strong> questions.
            </Typography>
            
            <Typography variant="body2" sx={{ 
              mb: 3, 
              color: '#ef4444',
              lineHeight: 1.6,
              fontStyle: 'italic'
            }}>
              Submitting now will evaluate your current progress and take you directly to the results page. You cannot return to complete more questions.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                onClick={cancelSubmit}
                sx={{
                  px: 3,
                  py: 1.5,
                  borderColor: '#64748b',
                  color: '#64748b',
                  '&:hover': {
                    borderColor: '#475569',
                    backgroundColor: '#f8fafc'
                  }
                }}
              >
                Continue Interview
              </Button>
              <Button
                variant="contained"
                onClick={confirmSubmit}
                sx={{
                  px: 3,
                  py: 1.5,
                  backgroundColor: '#f59e0b',
                  '&:hover': {
                    backgroundColor: '#d97706'
                  }
                }}
              >
                Submit Anyway
              </Button>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Main Content */}
      <Box sx={{ 
        flex: 1, 
        maxWidth: '1200px',
        mx: 'auto',
        width: '100%',
        px: { xs: 3, md: 4 },
        py: 4,
        display: 'flex',
        flexDirection: { xs: 'column', lg: 'row' },
        gap: 4,
        minHeight: 0
      }}>
        {/* Left Panel - Video and Controls */}
        <Box sx={{ 
          width: { xs: '100%', lg: '400px' },
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 3
        }}>
          {/* Video Feed */}
          <Paper sx={{
            p: 2,
            borderRadius: 2,
            backgroundColor: 'white',
            border: '1px solid #e2e8f0'
          }}>
            <Typography variant="subtitle2" sx={{ 
              mb: 2, 
              color: '#475569',
              fontWeight: 600,
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              letterSpacing: '0.05em'
            }}>
              Video Feed
            </Typography>
            
            <Box sx={{
              position: 'relative',
              width: '100%',
              height: 240,
              borderRadius: 2,
              overflow: 'hidden',
              backgroundColor: '#1e293b'
            }}>
              {isCameraOn && isCameraAvailable ? (
                <video 
                  ref={videoRef} 
                  autoPlay 
                  muted 
                  playsInline
                  style={{ 
                    width: '100%', 
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : isCameraOn && !isCameraAvailable ? (
                <Box sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8'
                }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress size={32} sx={{ color: '#3b82f6', mb: 2 }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Initializing Camera...
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8'
                }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ 
                      fontSize: '2rem', 
                      mb: 1,
                      opacity: 0.6 
                    }}>📹</Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Camera Inactive
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      Start recording to activate
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Paper>

          {/* Recording Controls */}
          <Paper sx={{
            p: 3,
            borderRadius: 2,
            backgroundColor: 'white',
            border: '1px solid #e2e8f0'
          }}>
            <Typography variant="subtitle2" sx={{ 
              mb: 3, 
              color: '#475569',
              fontWeight: 600,
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              letterSpacing: '0.05em'
            }}>
              Recording Controls
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Button
                variant={isRecording ? "contained" : "outlined"}
                color={isRecording ? "error" : "primary"}
                startIcon={isRecording ? <StopIcon /> : <MicIcon />}
                onClick={toggleRecording}
                disabled={isTranscribing || isRecordingDisabled}
                size="large"
                sx={{ 
                  width: '100%',
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderRadius: 2,
                  ...(isRecording && {
                    backgroundColor: '#dc2626',
                    '&:hover': {
                      backgroundColor: '#b91c1c'
                    }
                  }),
                  ...(!isRecording && {
                    borderColor: '#3b82f6',
                    color: '#3b82f6',
                    '&:hover': {
                      backgroundColor: '#3b82f6',
                      color: 'white'
                    }
                  })
                }}
              >
                {isRecording ? 'Stop Recording' : isTranscribing ? 'Processing...' : isRecordingDisabled ? 'Recording Complete' : 'Start Recording'}
              </Button>



              {/* Status Messages */}
              {isTranscribing && (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  color: '#3b82f6',
                  width: '100%',
                  justifyContent: 'center'
                }}>
                  <CircularProgress size={16} />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Processing audio...
                  </Typography>
                </Box>
              )}

              {transcriptionError && (
                <Alert severity="error" sx={{ width: '100%', fontSize: '0.875rem' }}>
                  {transcriptionError}
                </Alert>
              )}

              {evaluationError && (
                <Alert severity="error" sx={{ width: '100%', fontSize: '0.875rem' }}>
                  {evaluationError}
                </Alert>
              )}

            </Box>
          </Paper>
        </Box>

        {/* Right Panel - Question and Answer */}
        <Box sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          minWidth: 0
        }}>
          {/* Question Card */}
          <Paper sx={{
            p: 4,
            borderRadius: 2,
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Question Header */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              mb: 3,
              pb: 2,
              borderBottom: '1px solid #e2e8f0'
            }}>
              <Typography variant="subtitle2" sx={{ 
                color: '#475569',
                fontWeight: 600,
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                letterSpacing: '0.05em'
              }}>
                Interview Question
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1
              }}>
                <Box sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.875rem'
                }}>
                  {currentQuestionIndex + 1}
                </Box>
                <Typography variant="body2" sx={{ 
                  color: '#64748b',
                  fontWeight: 500,
                  fontSize: '0.875rem'
                }}>
                  of 10
                </Typography>
              </Box>
            </Box>
            
            {/* Question Content */}
            <Box sx={{ 
              height: 150, // Fixed height for consistent alignment
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center',
              mb: 4,
              p: 3,
              backgroundColor: '#f8fafc',
              borderRadius: 2,
              border: '1px solid #e2e8f0'
            }}>
              <Typography variant="h5" sx={{ 
                fontWeight: 600, 
                color: '#1e293b', 
                lineHeight: 1.4,
                fontSize: { xs: '1.25rem', md: '1.5rem', lg: '1.75rem' },
                textAlign: 'left',
                mb: 2
              }}>
                Question {currentQuestionIndex + 1}
              </Typography>
              
              <Typography variant="body1" sx={{ 
                color: '#374151',
                lineHeight: 1.6,
                fontSize: '1.1rem',
                textAlign: 'left',
                overflowY: 'auto',
                maxHeight: '100%',
                wordWrap: 'break-word'
              }}>
                {questions[currentQuestionIndex]}
              </Typography>
            </Box>

            {/* Answer Display */}
            <Box sx={{ 
              backgroundColor: '#ffffff',
              borderRadius: 2,
              border: '1px solid #e2e8f0',
              p: 3,
              height: 200, // Fixed height for consistent alignment
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                mb: 2,
                pb: 2,
                borderBottom: '1px solid #f1f5f9'
              }}>
                <Typography variant="subtitle2" sx={{ 
                  color: '#475569',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                  letterSpacing: '0.05em'
                }}>
                  Your Answer
                </Typography>
                
                {answer.trim() && (
                  <Typography variant="caption" sx={{ 
                    color: '#64748b',
                    fontSize: '0.75rem',
                    backgroundColor: '#f1f5f9',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    fontWeight: 500
                  }}>
                    {answer.trim().length} characters
                  </Typography>
                )}
              </Box>
              
              {answer.trim() ? (
                <Box sx={{ 
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start'
                }}>
                  <Typography variant="body1" sx={{ 
                    color: '#1e293b',
                    lineHeight: 1.6,
                    fontSize: '1rem',
                    textAlign: 'left',
                    overflowY: 'auto',
                    maxHeight: '100%',
                    wordWrap: 'break-word'
                  }}>
                    {answer}
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ 
                  flex: 1,
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  textAlign: 'center'
                }}>
                  <Typography variant="body2" sx={{ 
                    color: '#94a3b8',
                    fontStyle: 'italic',
                    fontSize: '1rem',
                    mb: 1
                  }}>
                    {isRecording ? '🎤 Listening for your response...' : 'Click "Start Recording" to begin your answer'}
                  </Typography>
                  {!isRecording && (
                    <Typography variant="caption" sx={{ 
                      color: '#cbd5e1',
                      fontSize: '0.75rem'
                    }}>
                      Minimum 20 characters required
                    </Typography>
                  )}
                </Box>
              )}
            </Box>

            {/* Action Buttons */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 4,
              pt: 3,
              borderTop: '1px solid #e2e8f0'
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2
              }}>
                <Typography variant="body2" sx={{ 
                  color: '#64748b',
                  fontSize: '0.875rem'
                }}>
                  {answer.trim() ? `${answer.trim().length} characters` : 'Minimum 20 characters required'}
                </Typography>
                
                {answer.trim() && answer.trim().length >= 20 && (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.5
                  }}>
                    <Box sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: '#10b981'
                    }} />
                    <Typography variant="caption" sx={{ 
                      color: '#10b981',
                      fontSize: '0.75rem',
                      fontWeight: 500
                    }}>
                      Ready to proceed
                    </Typography>
                  </Box>
                )}
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={openSubmitDialog}
                  disabled={isLoadingFeedback || isGettingOverallSuggestion}
                  sx={{ 
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    borderRadius: 2,
                    borderColor: '#ef4444',
                    color: '#ef4444',
                    '&:hover': {
                      borderColor: '#dc2626',
                      backgroundColor: '#fef2f2'
                    },
                    '&:disabled': {
                      borderColor: '#94a3b8',
                      color: '#94a3b8'
                    }
                  }}
                >
                  Submit Interview
                </Button>
                
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={handleNextQuestion}
                  disabled={isLoadingFeedback || !answer.trim() || answer.trim().length < 20}
                  sx={{ 
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    borderRadius: 2,
                    backgroundColor: '#3b82f6',
                    '&:hover': {
                      backgroundColor: '#2563eb'
                    },
                    '&:disabled': {
                      backgroundColor: '#94a3b8'
                    }
                  }}
                >
                  {isLoadingFeedback || isGettingOverallSuggestion ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                      {isGettingOverallSuggestion ? 'Finalizing...' : 'Processing...'}
                    </>
                  ) : (
                    currentQuestionIndex < 9 ? 'Next Question' : 'Complete Interview'
                  )}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default InterviewInterface;