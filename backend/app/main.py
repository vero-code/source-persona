import os
import uvicorn
from fastapi import FastAPI, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List
from backend.app.services.ai_agent import AIAgentService
from backend.app.services.tts_service import TTSService

# 1. Setup
app = FastAPI()
agent = AIAgentService()
tts_service = TTSService()

# 2. Models
class UserMessage(BaseModel):
    message: str
    mode: str = "hr"
    seniority: int = 2

class ReportRequest(BaseModel):
    chat_history: List[dict]

class TTSRequest(BaseModel):
    text: str

# 3. API Endpoints
@app.post("/api/chat")
async def chat(user_msg: UserMessage):
    """
    Accepts a user message, calls the AI agent, and returns the response.
    """
    response = agent.ask(user_msg.message, mode=user_msg.mode)
    return {"response": response}

@app.post("/api/generate-report")
async def generate_report(request: ReportRequest):
    """
    Generates a PDF report based on chat history.
    """
    pdf_bytes = agent.generate_hiring_report(request.chat_history)
    return Response(content=pdf_bytes, media_type="application/pdf")

@app.post("/api/tts")
async def text_to_speech(request: TTSRequest):
    """
    Synthesizes speech from text using Google Cloud TTS.
    """
    audio_bytes = tts_service.synthesize_speech(request.text)
    return Response(content=audio_bytes, media_type="audio/mpeg")

# 4. Static Files (Serve Frontend)
# Important: This must be AFTER the API routes
frontend_path = os.path.join(os.getcwd(), "frontend")
app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")

# 5. Run Configuration
if __name__ == "__main__":
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
