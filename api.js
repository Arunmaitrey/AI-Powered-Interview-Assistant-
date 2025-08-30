// API Utility Functions

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://13.204.155.120:8000/api/v1';

// Resume Validation API
export const resumeValidationAPI = {
  url: `${API_BASE_URL}${import.meta.env.VITE_RESUME_VALIDATION_ENDPOINT || '/resume_check'}`,
  validate: async (file) => {
    const formData = new FormData();
    formData.append('pdf_file', file);
    
    const response = await fetch(resumeValidationAPI.url, {
      method: 'POST',
      body: formData,
    });
    
    return response;
  }
};

// Interview Evaluation API
export const interviewEvaluationAPI = {
  url: `${API_BASE_URL}${import.meta.env.VITE_INTERVIEW_EVALUATION_ENDPOINT || '/evaluate'}`,
  evaluate: async (data) => {
    const response = await fetch(interviewEvaluationAPI.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return response;
  }
};

// Question Generation API
export const questionGenerationAPI = {
  url: `${API_BASE_URL}${import.meta.env.VITE_QUESTION_GENERATION_ENDPOINT || '/generate-interview'}`,
  generate: async (formData) => {
    const response = await fetch(questionGenerationAPI.url, {
      method: 'POST',
      body: formData,
    });
    
    return response;
  }
};

// Transcription API
export const transcriptionAPI = {
  url: import.meta.env.VITE_TRANSCRIPTION_FULL_URL || 'http://13.204.155.120:8000/transcribe',
  transcribe: async (audioBlob) => {
    const formData = new FormData();
    
    // Determine the correct filename based on the blob type
    let filename = 'recording.wav';
    if (audioBlob.type.includes('mp3')) {
      filename = 'recording.mp3';
    } else if (audioBlob.type.includes('mp4')) {
      filename = 'recording.mp4';
    } else if (audioBlob.type.includes('webm')) {
      filename = 'recording.webm';
    }
    
    formData.append('file', audioBlob, filename);
    
    console.log('Sending to transcription API:', {
      url: transcriptionAPI.url,
      filename: filename,
      blobType: audioBlob.type,
      blobSize: audioBlob.size
    });
    
    const response = await fetch(transcriptionAPI.url, {
      method: 'POST',
      body: formData,
    });
    
    return response;
  }
};

// Evaluation API
export const evaluationAPI = {
  url: `${API_BASE_URL}${import.meta.env.VITE_EVALUATION_ENDPOINT || '/evaluate'}`,
  evaluate: async (evaluationData) => {
    console.log('Sending to evaluation API:', {
      url: evaluationAPI.url,
      data: evaluationData
    });
    
    const response = await fetch(evaluationAPI.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(evaluationData)
    });
    
    return response;
  }
};

// Overall Suggestion API
export const overallSuggestionAPI = {
  url: `${API_BASE_URL}${import.meta.env.VITE_OVERALL_SUGGESTION_ENDPOINT || '/overall-suggestion'}`,
  getOverallSuggestion: async (suggestions) => {
    console.log('Sending to overall suggestion API:', {
      url: overallSuggestionAPI.url,
      suggestions: suggestions
    });
    
    const response = await fetch(overallSuggestionAPI.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ suggestions })
    });
    
    return response;
  }
};

// Generic API helper
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };
  
  const response = await fetch(url, {
    ...defaultOptions,
    ...options,
  });
  
  return response;
};

// Error handling helper
export const handleAPIError = (error, context = 'API call') => {
  console.error(`${context} error:`, error);
  
  if (error.name === 'AbortError') {
    return 'Request timed out. Please try again.';
  } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return 'Network error. Please check your connection.';
  } else if (error.name === 'TypeError' && error.message.includes('JSON')) {
    return 'Invalid response from server.';
  } else {
    return 'An unexpected error occurred.';
  }
};
