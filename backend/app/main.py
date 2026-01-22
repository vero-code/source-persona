import os
import uvicorn
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from backend.app.services.ai_agent import AIAgentService

# 1. Setup
app = FastAPI()
agent = AIAgentService()

# 2. Models
class UserMessage(BaseModel):
    message: str
    mode: str = "hr"

# 3. API Endpoints
@app.post("/api/chat")
async def chat(user_msg: UserMessage):
    """
    Accepts a user message, calls the AI agent, and returns the response.
    """
    response = agent.ask(user_msg.message, mode=user_msg.mode)
    return {"response": response}

# 4. Static Files (Serve Frontend)
# Important: This must be AFTER the API routes
frontend_path = os.path.join(os.getcwd(), "frontend")
app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")

# 5. Run Configuration
if __name__ == "__main__":
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
