import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, Box, Stepper, Step, StepLabel, Alert, Button,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { questionGenerationAPI, handleAPIError } from './utils/api';

// Import components
import PreparationStep from './components/InterviewSetup/PreparationStep';
import JobDetailsStep from './components/InterviewSetup/JobDetailsStep';
import InterviewRoundStep from './components/InterviewSetup/InterviewRoundStep';
import DifficultyStep from './components/InterviewSetup/DifficultyStep';
import ResumeUploadStep from './components/InterviewSetup/ResumeUploadStep';
import InterviewInterface from './components/Interview/InterviewInterface';
import InterviewResults from './components/Interview/InterviewResults';
import GenerationLoading from './components/InterviewSetup/GenerationLoading';

const InterviewPage = () => {
  const getSteps = () => {
    if (!selectedPreparation) return ['Preparation'];
    
    if (selectedPreparation === 'resume') {
      return ['Preparation', 'Job Details', 'Interview Round', 'Difficulty', 'Resume Upload'];
    } else if (selectedPreparation === 'job-description') {
      return ['Preparation', 'Job Details', 'Interview Round', 'Difficulty'];
    } else if (selectedPreparation === 'combined') {
      return ['Preparation', 'Job Details', 'Interview Round', 'Difficulty', 'Resume Upload'];
    }
    
    return ['Preparation'];
  };
  const [activeStep, setActiveStep] = useState(0);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeAnalysis, setResumeAnalysis] = useState(null);
  const [resumeAnalysisError, setResumeAnalysisError] = useState('');
  const [isResumeAnalyzing, setIsResumeAnalyzing] = useState(false);
  const [difficulty, setDifficulty] = useState(null);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentGenerationStep, setCurrentGenerationStep] = useState('');
  const [selectedPreparation, setSelectedPreparation] = useState(null);
  const [jobRoleSearch, setJobRoleSearch] = useState('');
  const [selectedJobRole, setSelectedJobRole] = useState('');
  const [companyNameSearch, setCompanyNameSearch] = useState('');
  const [selectedCompanyName, setSelectedCompanyName] = useState('');
  const [selectedInterviewRound, setSelectedInterviewRound] = useState('');
  const [questions, setQuestions] = useState([]);
  const [isInterviewMode, setIsInterviewMode] = useState(false);

  const [interviewResults, setInterviewResults] = useState(null);

  const navigate = useNavigate();

  // Job roles array
  const jobRoles = [
    "Account Manager", "Actuary", "Agile Coach / Scrum Master", "AI Engineer", "Application Support Engineer",
    "AR/VR Developer", "Associate Business Analyst", "Associate Consultant", "Associate Data Analyst",
    "Associate Product Manager", "Associate Software Engineer", "Automation Engineer", "Automation Testing Intern",
    "Backend Developer", "Bioinformatics Scientist", "Blockchain Developer", "Brand Manager",
    "Business Analyst", "Business Development Intern", "Business Development Manager", "Business Intelligence (BI) Developer",
    "Chartered Accountant (CA)", "Climate Risk Analyst", "Cloud Engineer", "Cloud Intern", "Clinical Research Associate",
    "Computer Science Intern", "Computer Vision Engineer", "Content Strategist", "Content Writer Intern",
    "Credit Analyst", "Customer Success Manager", "Customer Support Executive", "Cybersecurity Analyst",
    "Cybersecurity Engineer", "Cybersecurity Intern", "Data Analyst", "Data Analytics Intern",
    "Data Engineer", "Data Entry Operator", "Data Science Intern", "Data Scientist", "Database Administrator Intern",
    "Design Intern (UI/UX)", "DevOps Engineer", "Digital Marketing Intern", "Digital Marketing Specialist",
    "Drone Engineer", "Embedded Systems Engineer", "Engineering Intern", "Finance Intern",
    "Financial Analyst", "Financial Data Analyst", "Front Desk Associate", "Frontend Developer",
    "Frontend Intern", "Full Stack Intern", "Full-Stack Developer", "Game Developer",
    "Generative AI Specialist", "Graphic Design Intern", "Graphic Designer", "Growth Hacker",
    "Hardware Engineer Intern", "Healthcare Data Analyst", "Help Desk Support Intern", "HR Intern",
    "HR Manager", "Industrial Automation Engineer", "Insurance Risk Analyst", "Investment Banking Analyst",
    "IoT Engineer", "IT Support Engineer", "Java Developer Intern", "Junior Business Analyst",
    "Junior Data Engineer", "Junior Data Scientist", "Junior Developer", "Junior QA Engineer",
    "Junior Software Engineer", "Learning & Development Specialist", "Machine Learning Engineer",
    "Management Consultant", "Marketing Analyst", "Marketing Intern", "Medical Coder",
    "Mobile App Developer (iOS/Android)", "Mobile App Developer Intern", "MLOps Engineer",
    "Motion Graphics Designer", "Network Engineer Intern", "Network Security Engineer", "NLP Engineer",
    "Operations Intern", "Operations Manager", "Pharmacovigilance Specialist", "Portfolio Manager",
    "Product Designer", "Product Intern", "Product Manager", "Product Marketing Manager",
    "Project Manager", "Prompt Engineer (AI/LLM)", "Python Developer Intern", "QA Engineer / Test Automation Engineer",
    "Quality Assurance Intern", "Quantitative Analyst", "Quantum Computing Researcher",
    "Renewable Energy Engineer", "Research Intern", "Risk Analyst", "Risk Manager", "Robotics Engineer",
    "Sales Executive", "Sales Intern", "SEO Intern", "Site Reliability Engineer (SRE)",
    "Social Media Intern", "Software Engineer", "Software Intern", "Strategy Consultant",
    "Support Engineer Intern", "Sustainability Analyst", "Tax Consultant", "Talent Acquisition Specialist",
    "Technical Product Manager", "Technical Support Intern", "Training & Development Intern",
    "UI Designer", "UX Designer", "UX Researcher", "Web Developer Intern", "Web3 Developer"
  ];

  // Company names array
  const companyNames = [
    "ABB", "Adobe", "Airbnb", "Amazon", "American Express", "Apple", "AstraZeneca",
    "Atlassian", "Autodesk", "Bain & Company", "Barclays", "BCG", "Binance", "BlackRock",
    "Blue Origin", "BNP Paribas", "Bosch", "Boston Consulting Group (BCG)", "Byju's",
    "Canva", "Capgemini", "Check Point", "Cisco", "Citi", "Coca-Cola", "Cognizant",
    "Coinbase", "Consensys", "CrowdStrike", "Databricks", "Deloitte", "Disney",
    "EA Sports", "Enphase", "Epic Games", "Ethereum Foundation", "EY", "Fidelity",
    "Figma", "FireEye", "First Solar", "Flipkart", "Fortinet", "Freshworks",
    "GE Healthcare", "GlaxoSmithKline (GSK)", "Goldman Sachs", "Google", "Google DeepMind",
    "HCL", "Hitachi Energy", "Honeywell", "HSBC", "HubSpot", "IBM", "IDEO", "Indeed",
    "Infosys", "Intel", "IQVIA", "JP Morgan", "Johnson & Johnson", "KPMG", "LinkedIn",
    "McAfee", "McKinsey", "Meta (Facebook)", "Microsoft", "Morgan Stanley", "Naukri",
    "Netflix", "Nielsen", "Nvidia", "Ogilvy", "Ola", "OpenAI", "Oracle", "Ørsted",
    "Palo Alto Networks", "Palantir", "PayPal", "PepsiCo", "Pfizer", "Philips Healthcare",
    "Pixar", "Polygon", "Procter & Gamble (P&G)", "PwC", "Qualcomm", "Ripple", "Rivian",
    "Roche", "Salesforce", "Samsung", "Sanofi", "SAP", "SAS", "Schneider Electric",
    "ServiceNow", "Siemens", "Snowflake", "Solana", "Sony PlayStation", "SpaceX",
    "Spotify", "Square", "Stripe", "Swiggy", "Symantec", "TCS", "Tech Mahindra",
    "Tesla", "Texas Instruments", "Thermo Fisher", "Uber", "Ubisoft", "Unilever",
    "VMware", "WhiteHat Jr.", "Wipro", "WPP", "Zoho", "Zomato"
  ];



  const fetchQuestions = useCallback(async () => {
    console.log('fetchQuestions called');
    setIsLoading(true);
    setError('');
    setGenerationProgress(0);
    setCurrentGenerationStep('Analyzing your profile...');

    const generationSteps = [
      'Analyzing your profile...',
      'Processing resume and job details...',
      'Generating personalized questions...',
      'Optimizing difficulty level...',
      'Preparing interview interface...'
    ];

    try {
      // Step 1: Analyze profile (10%)
      setCurrentGenerationStep(generationSteps[0]);
      setGenerationProgress(10);
      await new Promise(resolve => setTimeout(resolve, 800));

      // Step 2: Process data (25%)
      setCurrentGenerationStep(generationSteps[1]);
      setGenerationProgress(25);
      await new Promise(resolve => setTimeout(resolve, 600));

      // Determine the type based on preparation type
      let type;
      if (selectedPreparation === 'resume') {
        type = 1; // Resume only
      } else if (selectedPreparation === 'job-description') {
        type = 2; // JD + Company, no resume
      } else if (selectedPreparation === 'combined') {
        type = 3; // Resume + JD + Company
      }

      // Convert difficulty to numeric
      const difficultyMap = {
        'easy': 1,
        'medium': 2,
        'hard': 3
      };

      // Create FormData for the API request
      const formData = new FormData();
      formData.append('type', type.toString());
      formData.append('job_roles', selectedJobRole);
      formData.append('round_type', selectedInterviewRound);
      formData.append('difficulty', difficultyMap[difficulty].toString());

      // Add company name and job description for types 2 and 3
      if (type === 2 || type === 3) {
        formData.append('company_name', selectedCompanyName);
        formData.append('job_description', jobDescription);
      }

      // Add resume file for types 1 and 3
      if (type === 1 || type === 3) {
        if (resumeFile) {
          formData.append('pdf_file', resumeFile);
        } else {
          throw new Error('Resume file is required for this preparation type');
        }
      }

      console.log('Sending request with data:', {
        type,
        job_roles: selectedJobRole,
        round_type: selectedInterviewRound,
        difficulty: difficultyMap[difficulty],
        company_name: selectedCompanyName,
        job_description: jobDescription,
        has_resume: !!resumeFile
      });

      // Step 3: Generate questions (50%)
      setCurrentGenerationStep(generationSteps[2]);
      setGenerationProgress(50);

      // Make API call to generate questions
      const response = await questionGenerationAPI.generate(formData);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      // Step 4: Optimize difficulty (75%)
      setCurrentGenerationStep(generationSteps[3]);
      setGenerationProgress(75);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Extract questions from the response
      if (data.questions && Array.isArray(data.questions)) {
        setQuestions(data.questions);
      } else {
        throw new Error('Invalid response format: questions not found');
      }

      // Step 5: Prepare interface (100%)
      setCurrentGenerationStep(generationSteps[4]);
      setGenerationProgress(100);
      await new Promise(resolve => setTimeout(resolve, 400));

      setIsInterviewMode(true);
      setError('');
    } catch (error) {
      console.error('Error generating questions:', error);
      setError(`Failed to generate questions: ${handleAPIError(error, 'Question generation')}`);
      
      // Fallback to basic questions if API fails
      const fallbackQuestions = [
        "Tell me about your background and experience.",
        "What interests you about this position?",
        "How do you handle challenges in your work?",
        "What are your key strengths?",
        "Where do you see yourself in 5 years?"
      ];
      setQuestions(fallbackQuestions);
      setIsInterviewMode(true);
    } finally {
      setIsLoading(false);
      setGenerationProgress(0);
      setCurrentGenerationStep('');
    }
  }, [selectedPreparation, selectedJobRole, selectedInterviewRound, difficulty, selectedCompanyName, jobDescription, resumeFile]);

  const handleInterviewComplete = (interviewData) => {
    console.log('Interview completed with results:', interviewData);
    setInterviewResults(interviewData);
    setIsInterviewMode(false);
  };

  const handleInterviewExit = () => {
    console.log('handleInterviewExit called - exiting interview mode');
    setIsInterviewMode(false);
    setQuestions([]);
    setActiveStep(0);
  };

  const handleBackToHome = () => {
    setInterviewResults(null);
    setSelectedPreparation(null);
    setActiveStep(0);
    setQuestions([]);
    setIsInterviewMode(false);
    // Reset all other states
    setResumeFile(null);
    setResumeAnalysis(null);
    setResumeAnalysisError('');
    setIsResumeAnalyzing(false);
    setDifficulty(null);
    setJobTitle('');
    setJobDescription('');
    setError('');
    setIsLoading(false);
    setJobRoleSearch('');
    setSelectedJobRole('');
    setCompanyNameSearch('');
    setSelectedCompanyName('');
    setSelectedInterviewRound('');
  };

  const handleNext = () => {
    const steps = getSteps();
    const currentStepName = steps[activeStep];
    
    if (currentStepName === 'Difficulty') {
      if (selectedPreparation === 'job-description') {
        // For job-description only, go directly to interview
        fetchQuestions();
    } else {
        // For resume and combined, go to resume upload
        setActiveStep(prev => prev + 1);
      }
    } else if (currentStepName === 'Resume Upload') {
      // Generate questions after resume upload
      fetchQuestions();
    } else {
      // Normal step progression
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (activeStep === 1) {
      // If we're on step 1 and going back, clear the preparation selection
      // and go back to preparation step
      setSelectedPreparation(null);
      setActiveStep(0);
    } else {
      setActiveStep(prev => prev - 1);
    }
  };

  const isNextDisabled = () => {
    const steps = getSteps();
    const currentStepName = steps[activeStep];
    
    if (currentStepName === 'Preparation' && !selectedPreparation) return true;
    if (currentStepName === 'Job Details') {
      if (selectedPreparation === 'resume' && !selectedJobRole) return true;
      if ((selectedPreparation === 'job-description' || selectedPreparation === 'combined')) {
        if (!selectedJobRole || !selectedCompanyName || !jobDescription.trim()) return true;
      }
    }
    if (currentStepName === 'Interview Round' && !selectedInterviewRound) return true;
    if (currentStepName === 'Difficulty' && difficulty === null) return true;
    if (currentStepName === 'Resume Upload' && (!resumeFile || isResumeAnalyzing)) return true;
    return false;
  };

  // Reset search when preparation changes
  useEffect(() => {
    if (selectedPreparation !== 'resume') {
      setJobRoleSearch('');
      setSelectedJobRole('');
      setSelectedInterviewRound('');
    }
    if (selectedPreparation !== 'job-description' && selectedPreparation !== 'combined') {
      setCompanyNameSearch('');
      setSelectedCompanyName('');
    }
    
    // Reset resume-related state when preparation type changes
    setResumeFile(null);
    setResumeAnalysis(null);
    setResumeAnalysisError('');
    setIsResumeAnalyzing(false);
    
    // Reset difficulty level when preparation type changes
    setDifficulty(null);
    
    // Reset job description when preparation type changes
    setJobDescription('');
  }, [selectedPreparation]);

  // Auto-advance when preparation is selected
  useEffect(() => {
    if (selectedPreparation && activeStep === 0) {
      setActiveStep(1);
    }
  }, [selectedPreparation, activeStep]);

    // If interview results are available, show the results
  if (interviewResults) {
    return (
      <InterviewResults
        results={interviewResults}
        onBackToHome={handleBackToHome}
      />
    );
  }

  // If in interview mode, show the interview interface
  if (isInterviewMode) {
    return (
      <InterviewInterface
        questions={questions}
        onComplete={handleInterviewComplete}
        onExit={handleInterviewExit}
        error={error}
        setError={setError}
      />
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Generation Loading Overlay */}
      <GenerationLoading
        isLoading={isLoading}
        progress={generationProgress}
        currentStep={currentGenerationStep}
        steps={[
          'Analyzing your profile...',
          'Processing resume and job details...',
          'Generating personalized questions...',
          'Optimizing difficulty level...',
          'Preparing interview interface...'
        ]}
      />
      {selectedPreparation && (
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {getSteps().map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {isLoading && activeStep === getSteps().length - 1 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Generating personalized interview questions based on your selections...
        </Alert>
      )}
      
      {/* Step Content */}
      {getSteps()[activeStep] === 'Preparation' && (
        <PreparationStep
          selectedPreparation={selectedPreparation}
          setSelectedPreparation={setSelectedPreparation}
        />
      )}

      {getSteps()[activeStep] === 'Job Details' && (
        <JobDetailsStep
          key={selectedPreparation} // Force re-render when preparation type changes
          selectedPreparation={selectedPreparation}
          selectedJobRole={selectedJobRole}
          setSelectedJobRole={setSelectedJobRole}
          jobRoleSearch={jobRoleSearch}
          setJobRoleSearch={setJobRoleSearch}
          selectedCompanyName={selectedCompanyName}
          setSelectedCompanyName={setSelectedCompanyName}
          companyNameSearch={companyNameSearch}
          setCompanyNameSearch={setCompanyNameSearch}
          jobDescription={jobDescription}
          setJobDescription={setJobDescription}
          jobRoles={jobRoles}
          companyNames={companyNames}
        />
      )}

      {getSteps()[activeStep] === 'Interview Round' && (
        <InterviewRoundStep
          selectedInterviewRound={selectedInterviewRound}
          setSelectedInterviewRound={setSelectedInterviewRound}
        />
      )}

      {getSteps()[activeStep] === 'Difficulty' && (
        <DifficultyStep
          key={selectedPreparation} // Force re-render when preparation type changes
          difficulty={difficulty}
          setDifficulty={setDifficulty}
        />
      )}

      {getSteps()[activeStep] === 'Resume Upload' && (
        <ResumeUploadStep
          key={selectedPreparation} // Force re-render when preparation type changes
          selectedPreparation={selectedPreparation}
          resumeFile={resumeFile}
          setResumeFile={setResumeFile}
          resumeAnalysis={resumeAnalysis}
          setResumeAnalysis={setResumeAnalysis}
          resumeAnalysisError={resumeAnalysisError}
          setResumeAnalysisError={setResumeAnalysisError}
          isResumeAnalyzing={isResumeAnalyzing}
          setIsResumeAnalyzing={setIsResumeAnalyzing}
        />
      )}

      {/* Navigation Buttons */}
      {selectedPreparation && activeStep < getSteps().length && !isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={false}
            onClick={handleBack}
            variant="outlined"
            sx={{ px: 4, py: 1.5, fontSize: '1.1rem', fontWeight: 600 }}
          >
            Back
          </Button>
          
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={isNextDisabled() || isLoading}
               sx={{
              px: 4, 
              py: 1.5, 
              fontSize: '1.1rem', 
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                 '&:hover': {
                boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                transform: 'translateY(-1px)'
              }
            }}
             >
               {isLoading ? (
                 <>
                <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                   Generating Questions...
                 </>
               ) : (
              activeStep === getSteps().length - 1 ? 'Start Interview' : 'Continue'
               )}
             </Button>
           </Box>
      )}
    </Container>
  );
};

export default InterviewPage;
