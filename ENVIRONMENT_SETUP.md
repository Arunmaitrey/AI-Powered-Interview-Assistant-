# Environment Setup

This document explains how to set up environment variables for the Interview Elegance application.

## Environment Variables

The application uses environment variables to manage API endpoints and other configuration settings.

### Required Environment Variables

Create a `.env` file in the `client` directory with the following variables:

```env
# API Base URL
VITE_API_BASE_URL=http://13.204.155.120:8000/api/v1

# API Endpoints
VITE_RESUME_VALIDATION_ENDPOINT=/resume_check
VITE_INTERVIEW_EVALUATION_ENDPOINT=/evaluate
VITE_QUESTION_GENERATION_ENDPOINT=/generate-interview
```

### Environment Variable Details

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Base URL for all API endpoints | `http://13.204.155.120:8000/api/v1` |
| `VITE_RESUME_VALIDATION_ENDPOINT` | Endpoint for resume validation | `/resume_check` |
| `VITE_INTERVIEW_EVALUATION_ENDPOINT` | Endpoint for interview evaluation | `/evaluate` |
| `VITE_QUESTION_GENERATION_ENDPOINT` | Endpoint for question generation | `/generate-interview` |

## Setup Instructions

### 1. Development Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your actual API endpoints

3. Restart the development server:
   ```bash
   npm run dev
   ```

### 2. Production Deployment

1. Set environment variables in your hosting platform (Vercel, Netlify, etc.)
2. Ensure all required variables are configured
3. Deploy the application

### 3. Local Development

The `.env` file is automatically loaded by Vite during development. Make sure to:
- Never commit the `.env` file to version control
- Use `.env.example` as a template
- Update environment variables when API endpoints change

## Security Notes

- Environment variables prefixed with `VITE_` are exposed to the client-side code
- Only include non-sensitive configuration in these variables
- Never include API keys or secrets in client-side environment variables
- Use server-side environment variables for sensitive data

## Troubleshooting

### Common Issues

1. **Environment variables not loading**
   - Ensure the `.env` file is in the `client` directory
   - Restart the development server after changes
   - Check that variable names start with `VITE_`

2. **API calls failing**
   - Verify the API endpoints are correct
   - Check network connectivity
   - Ensure the API servers are running

3. **Build errors**
   - Make sure all required environment variables are set
   - Check for typos in variable names
   - Verify the `.env` file format is correct

## File Structure

```
client/
├── .env                 # Environment variables (not in version control)
├── .env.example         # Example environment file (in version control)
├── .gitignore          # Git ignore rules
└── src/
    ├── components/
    │   ├── InterviewSetup/
    │   │   └── ResumeUploadStep.jsx  # Uses VITE_API_BASE_URL + VITE_RESUME_VALIDATION_ENDPOINT
    │   └── Interview/
    │       └── InterviewInterface.jsx # Uses VITE_API_BASE_URL + VITE_INTERVIEW_EVALUATION_ENDPOINT
    └── utils/
        └── api.js  # Uses VITE_API_BASE_URL + VITE_QUESTION_GENERATION_ENDPOINT
    └── ...
```

## API Endpoints

### Resume Validation API
- **Endpoint**: `VITE_API_BASE_URL` + `VITE_RESUME_VALIDATION_ENDPOINT`
- **Full URL**: `https://smart-interview-backend.blackbucks.me/api/v1/resume_check`
- **Method**: POST
- **Content-Type**: multipart/form-data
- **Field**: pdf_file
- **Response**: `{"is_resume": "YES"}` or error message

### Interview Evaluation API
- **Endpoint**: `VITE_API_BASE_URL` + `VITE_INTERVIEW_EVALUATION_ENDPOINT`
- **Full URL**: `https://smart-interview-backend.blackbucks.me/api/v1/evaluate`
- **Method**: POST
- **Content-Type**: application/json
- **Body**: Array of question-answer pairs
- **Response**: Evaluation results with scores and feedback
