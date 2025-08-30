import json
import logging
import re
from typing import List, Optional

import boto3
from fastapi import FastAPI, APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import PyPDF2

app = FastAPI(
    title="AI Interview System",
    description="Generate and evaluate interview questions using AWS Bedrock (LLaMA 3)",
    version="2.0.0"
)

router = APIRouter(prefix="/api/v1")

logging.basicConfig(
    level=logging.INFO,
    filename="interview.log",
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

BEDROCK_MODEL_ID = "meta.llama3-8b-instruct-v1:0"
bedrock = boto3.client(service_name="bedrock-runtime")

class DifficultyParams(BaseModel):
    max_gen_len: int = 512
    temperature: float = 0.7
    top_p: float = 0.9

class InterviewResponse(BaseModel):
    generated_questions: List[str]
    model: str
    difficulty: int

class QAItem(BaseModel):
    question: str
    answer: str

class FeedbackItem(BaseModel):
    question: str
    answer: str
    clarity_score: float
    relevance_score: float
    communication: float
    confidence: float
    structure: float
    suggestion: str
    improvements: str
    example_answer: str

class FeedbackResponse(BaseModel):
    results: List[FeedbackItem]

DIFFICULTY_MAPPING = {
    1: DifficultyParams(max_gen_len=256, temperature=0.5, top_p=0.7),
    2: DifficultyParams(max_gen_len=512, temperature=0.7, top_p=0.9),
    3: DifficultyParams(max_gen_len=768, temperature=0.9, top_p=1.0)
}

def get_difficulty_params(difficulty: int) -> DifficultyParams:
    return DIFFICULTY_MAPPING.get(difficulty, DIFFICULTY_MAPPING[2])

async def extract_text_from_pdf(pdf_file: UploadFile) -> str:
    if not pdf_file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Invalid PDF file")
    try:
        text = ""
        reader = PyPDF2.PdfReader(pdf_file.file)
        for page in reader.pages:
            text += page.extract_text() or ""
        return text.strip()
    except Exception as e:
        logger.error(f"PDF error: {e}")
        raise HTTPException(status_code=400, detail="PDF processing failed")

async def call_bedrock(prompt: str, params: DifficultyParams) -> str:
    try:
        body = json.dumps({
            "prompt": prompt,
            "max_gen_len": params.max_gen_len,
            "temperature": params.temperature,
            "top_p": params.top_p
        })
        response = bedrock.invoke_model(
            body=body,
            modelId=BEDROCK_MODEL_ID,
            accept="application/json",
            contentType="application/json"
        )
        return json.loads(response["body"].read().decode()).get("generation", "").strip()
    except Exception as e:
        logger.error(f"Bedrock error: {e}")
        raise HTTPException(status_code=500, detail="Model service unavailable")

@router.post("/interview-questions", response_model=InterviewResponse)
async def generate_questions(
    pdf_file: UploadFile = File(...),
    difficulty: int = Form(..., ge=1, le=3),
    job_description: Optional[str] = Form(None)
):
    resume_text = await extract_text_from_pdf(pdf_file)
    if not resume_text:
        raise HTTPException(status_code=400, detail="Empty resume content")
    
    prompt = f"""Generate {10 if difficulty == 1 else 15 if difficulty == 2 else 20} interview questions based on this resume:
{resume_text}
"""
    if job_description:
        prompt += f"\nAnd job description:\n{job_description}"
    prompt += "\n\nFormat as numbered questions only."

    params = get_difficulty_params(difficulty)
    try:
        response_text = await call_bedrock(prompt, params)
        questions = [q.strip() for q in re.findall(r"\d+\.\s*(.+?)(?=\n\d+\.|\Z)", response_text)]
        if not questions:
            raise HTTPException(status_code=500, detail="Failed to generate questions")
        return InterviewResponse(
            generated_questions=questions[:10],  # Limit to 10 questions
            model=BEDROCK_MODEL_ID,
            difficulty=difficulty
        )
    except Exception as e:
        logger.error(f"Question generation failed: {e}")
        raise HTTPException(status_code=500, detail="Question generation failed")

@router.post("/evaluate-answers", response_model=FeedbackResponse)
async def evaluate_answers(items: List[QAItem]):
    if not items or len(items) > 10:
        raise HTTPException(status_code=400, detail="Provide 1-10 answers for evaluation")

    prompt = """Evaluate each interview Q&A pair COMPLETELY and INDEPENDENTLY. For each, provide:
1. clarity_score (1-10): How clear and understandable the answer was
2. relevance_score (1-10): How relevant the answer was to the question  
3. communication (1-10): How effectively the answer communicated ideas
4. confidence (1-10): How confident the answer sounded
5. structure (1-10): How well-structured the answer was
6. suggestion: Specific suggestion for improvement
7. improvements: Detailed areas for improvement
8. example_answer: A model answer for comparison

Format response as JSON with these exact field names. Example:
{
  "results": [
    {
      "question": "What is Python?",
      "answer": "A programming language",
      "clarity_score": 7,
      "relevance_score": 8,
      "communication": 6,
      "confidence": 7,
      "structure": 6,
      "suggestion": "Could provide more technical details",
      "improvements": "Add version info, key features, and use cases",
      "example_answer": "Python is a high-level, interpreted programming language..."
    }
  ]
}

Now evaluate these:
"""
    
    for item in items:
        prompt += f"\nQuestion: {item.question}\nAnswer: {item.answer}\n"

    try:
        response_text = await call_bedrock(
            prompt,
            DifficultyParams(max_gen_len=3072, temperature=0.3, top_p=0.7)
        )
        
        # Extract JSON from response
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if not json_match:
            raise ValueError("Invalid JSON response format")
        
        return JSONResponse(content=json.loads(json_match.group()))
        
    except Exception as e:
        logger.error(f"Evaluation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")

app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)