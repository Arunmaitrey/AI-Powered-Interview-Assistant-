# API Configuration Guide

## Environment Variables Setup

Create a `.env` file in the `client` directory with the following configuration:

```env
# API Base URL
VITE_API_BASE_URL=http://13.204.155.120:8000/api/v1

# API Endpoints
VITE_RESUME_VALIDATION_ENDPOINT=/resume_check
VITE_INTERVIEW_EVALUATION_ENDPOINT=/evaluate
VITE_QUESTION_GENERATION_ENDPOINT=/generate-interview
VITE_TRANSCRIPTION_ENDPOINT=/transcribe
VITE_EVALUATION_ENDPOINT=/evaluate
VITE_OVERALL_SUGGESTION_ENDPOINT=/overall-suggestion

# Full API URLs (for endpoints that don't follow the base URL pattern)
VITE_TRANSCRIPTION_FULL_URL=http://13.204.155.120:8000/transcribe
```

## API Endpoints Overview

| Endpoint | Purpose | Environment Variable |
|----------|---------|---------------------|
| `/resume_check` | Resume validation | `VITE_RESUME_VALIDATION_ENDPOINT` |
| `/evaluate` | Individual question evaluation | `VITE_EVALUATION_ENDPOINT` |
| `/generate-interview` | Question generation | `VITE_QUESTION_GENERATION_ENDPOINT` |
| `/transcribe` | Audio transcription | `VITE_TRANSCRIPTION_FULL_URL` |
| `/overall-suggestion` | Overall feedback | `VITE_OVERALL_SUGGESTION_ENDPOINT` |

## Benefits of Environment Variables

1. **Centralized Configuration**: All API endpoints in one place
2. **Easy Deployment**: Change endpoints without code changes
3. **Environment Flexibility**: Different endpoints for dev/staging/prod
4. **Security**: Sensitive URLs not hardcoded in source code
5. **Maintainability**: Single source of truth for all API configurations

## Usage

The application will automatically use these environment variables. If any variable is not set, it will fall back to the default values defined in the code.
