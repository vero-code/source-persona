# backend/app/services/ai_agent.py
import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv
from pypdf import PdfReader

# Load environment variables
load_dotenv()

class AIAgentService:
    def __init__(self):
        # 1. API Key Configuration
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            print("⚠️ ERROR: GEMINI_API_KEY is missing in .env file.")
            self.client = None
            return

        # 2. Initialize Client
        self.client = genai.Client(api_key=api_key)
        
        # 3. Load Memory (GitHub JSON + PDF Resume)
        self.profile_data = self._load_profile_data()
        self.resume_text = self._load_resume_pdf()
        
        # 4. System Instruction (HYBRID RAG)
        self.system_instruction = f"""
ROLE:
You are the AI Digital Twin of Veronika Kashtanova, a Senior AI Engineer & Founder based in Ukraine.
Your goal is to represent her technical skills, portfolio, and "builder" mindset to recruiters and engineers.

TONE:
Confident, concise, professional, slightly "geeky" but accessible. Silicon Valley vibe.
Always use "we" or "I" (representing Veronika) when talking about projects.
Focus on results (metrics, stack), not just descriptions.

DATA SOURCE 1: OFFICIAL RESUME (Education & Soft Skills)
{self.resume_text}

DATA SOURCE 2: LIVE GITHUB PORTFOLIO (Real-time Code)
{json.dumps(self.profile_data, indent=2)}

INSTRUCTIONS:
1. PROOF OVER PROMISES (Skill Verification):
   - When asked about a skill (e.g., "Do you know Python?"), PROVE IT by citing a specific project from DATA SOURCE 2.
   - Example: "Yes. In 'Stream Refinery', I used Python to build a Kafka consumer..."
   - Never just list skills; anchor them to real work.

2. DATA SYNTHESIS (The "Tell me about yourself" Logic):
   - Combine sources. Use RESUME for education/past jobs and GITHUB for the latest achievements.
   - Example: "With a Master's degree and 10 years of Backend experience (Resume), I recently pivoted to Generative AI, shipping over 37 projects in 2025 (GitHub)."

3. VISUALIZATION PROTOCOL (Mermaid.js):
   - If explaining architecture, flows, or logic, ALWAYS generate a Mermaid diagram wrapped in ```mermaid``` code blocks.

4. SPECIFIC ANSWERS (Hardcoded Personal Details):
   - Contact Info: "You can reach me via X (@veron_code) or check my code on GitHub (https://github.com/vero-code)."
   - Availability: "Open to Lead/Founder roles in Big Tech and Grant opportunities."

5. HONESTY PROTOCOL:
   - If information is not in the Resume or GitHub, say: "I don't have that record in my databanks."
   - DO NOT hallucinate experiences or companies not listed in the provided data.
"""
        
        # 5. Initialize Chat
        try:
            self.model_name = "gemini-3-flash-preview"
            self.chat_session = self.client.chats.create(
                model=self.model_name,
                config=types.GenerateContentConfig(
                    system_instruction=self.system_instruction,
                    temperature=0.7
                )
            )
        except Exception as e:
            print(f"⚠️ Model Init Error: {e}")
            self.client = None

    def _load_profile_data(self):
        """Loads the GitHub JSON file"""
        try:
            path = os.path.join(os.getcwd(), "backend", "data", "dynamic_profile.json")
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except FileNotFoundError:
            return {"error": "Profile data not found. Please run github_sync.py first."}

    def _load_resume_pdf(self):
        """Loads and extracts text from resume.pdf"""
        try:
            path = os.path.join(os.getcwd(), "backend", "data", "resume.pdf")
            
            if not os.path.exists(path):
                print(f"⚠️ Resume PDF not found at: {path}")
                return "Resume data not provided."
                
            reader = PdfReader(path)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            
            print("✅ PDF Resume loaded successfully.")
            return text
        except Exception as e:
            print(f"❌ Error reading PDF: {e}")
            return "Error reading resume."

    def ask(self, message: str) -> str:
        """Sends a message to the agent"""
        if not self.client:
            return "Agent is not initialized (check API key)."
        try:
            response = self.chat_session.send_message(message)
            return response.text
        except Exception as e:
            return f"AI System Error: {str(e)}"

# CLI Test Loop
if __name__ == "__main__":
    agent = AIAgentService()
    print(f"\n💬 Veronika's Agent ({getattr(agent, 'model_name', 'Unknown')}) is Online.")
    print("-" * 50)
    
    while True:
        try:
            user_input = input("Recruiter > ")
            if user_input.lower() in ["exit", "quit"]:
                print("Shutting down...")
                break
            
            # Get response from AI
            answer = agent.ask(user_input)
            print(f"\nVeronika's Agent > {answer}\n")
            print("-" * 50)
            
        except KeyboardInterrupt:
            print("\nShutting down...")
            break