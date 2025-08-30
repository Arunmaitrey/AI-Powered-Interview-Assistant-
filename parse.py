import json
import logging
import os
from typing import List, Optional
import PyPDF2
import requests
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import re

app = FastAPI(
    title="AI Interview System",
    description="API for generating and evaluating interview questions",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

OLLAMA_API_URL = "http://localhost:11434/api/generate"
DEFAULT_MODEL = "llama3.2:1b"

class DifficultyParams(BaseModel):
    top_k: int = 50
    top_p: float = 0.9
    temperature: float = 0.7

class InterviewResponse(BaseModel):
    generated_questions: List[str]
    model: str
    difficulty: int

class QAItem(BaseModel):
    question: str
    answer: str

class EvaluationResult(BaseModel):
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

class EvaluationResponse(BaseModel):
    results: List[EvaluationResult]

DIFFICULTY_MAPPING = {
    1: DifficultyParams(top_k=10, top_p=0.5, temperature=0.7),
    2: DifficultyParams(top_k=30, top_p=0.7, temperature=0.8),
    3: DifficultyParams(top_k=50, top_p=0.9, temperature=1.0)
}

async def extract_text_from_pdf(pdf_file: UploadFile) -> str:
    try:
        text = ""
        pdf_reader = PyPDF2.PdfReader(pdf_file.file)
        for page in pdf_reader.pages:
            text += page.extract_text() or ""
        return text.strip()
    except Exception as e:
        logger.error(f"PDF error: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid PDF file")

async def call_ollama(prompt: str, params: DifficultyParams) -> str:
    try:
        response = requests.post(
            OLLAMA_API_URL,
            json={
                "model": DEFAULT_MODEL,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "top_k": params.top_k,
                    "top_p": params.top_p,
                    "temperature": params.temperature
                }
            },
            timeout=60
        )
        response.raise_for_status()
        return response.json().get("response", "")
    except Exception as e:
        logger.error(f"Ollama error: {str(e)}")
        raise HTTPException(status_code=500, detail="Model service unavailable")

@app.post("/api/v1/interview-questions", response_model=InterviewResponse)
async def generate_questions(
    pdf_file: UploadFile = File(...),
    difficulty: int = Form(..., ge=1, le=3),
):
    try:
        resume_text = await extract_text_from_pdf(pdf_file)
        prompt = f"Generate {10 if difficulty == 1 else 15 if difficulty == 2 else 20} interview questions based on this resume:\n{resume_text[:3000]}\nFormat as numbered questions only."
        params = DIFFICULTY_MAPPING.get(difficulty, DIFFICULTY_MAPPING[2])
        response = await call_ollama(prompt, params)
        questions = [q.split('. ', 1)[1] for q in response.split('\n') if q.strip()]
        return {"generated_questions": questions[:10], "model": DEFAULT_MODEL, "difficulty": difficulty}
    except Exception as e:
        logger.error(f"Generation error: {str(e)}")
        raise HTTPException(status_code=500, detail="Question generation failed")

@app.post("/api/v1/evaluate", response_model=EvaluationResponse)
async def evaluate_answers(items: List[QAItem]):
    try:
        results = []
        for item in items:
            prompt = f"""Evaluate this Q&A pair:
            Question: {item.question}
            Answer: {item.answer}
            Provide JSON with these fields:
            - clarity_score (1-10)
            - relevance_score (1-10)
            - communication (1-10)
            - confidence (1-10)
            - structure (1-10)
            - suggestion
            - improvements
            - example_answer"""
            
            response = await call_ollama(prompt, DIFFICULTY_MAPPING[2])
            json_str = response.replace('```json', '').replace('```', '').strip()
            evaluation = json.loads(json_str)
            results.append(EvaluationResult(
                question=item.question,
                answer=item.answer,
                **evaluation
            ))
        return {"results": results}
    except Exception as e:
        logger.error(f"Evaluation error: {str(e)}")
        raise HTTPException(status_code=500, detail="Evaluation failed")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)