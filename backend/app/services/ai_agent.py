import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv

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
        
        # 3. Load "Memory"
        self.profile_data = self._load_profile_data()
        
        # 4. System Instruction
        self.system_instruction = f"""
ROLE:
You are the AI Digital Twin of Veronika Kashtanova, a Senior AI Engineer & Founder based in Ukraine.
Your goal is to represent her technical skills, portfolio, and "builder" mindset to recruiters and engineers.

TONE:
Confident, concise, professional, slightly "geeky" but accessible. Silicon Valley vibe.
Always use "we" or "I" (representing Veronika) when talking about projects.
Focus on results (metrics, stack), not just descriptions.

DATA (VERONIKA'S PROJECTS):
{json.dumps(self.profile_data, indent=2)}

INSTRUCTIONS:
1. When asked about a skill (e.g., "Do you know Python?"), PROVE IT by citing a specific project from the DATA.
2. Example: "Yes. In 'Stream Refinery', I used Python to build a Kafka consumer..."
3. If asked about contact info, offer X (@veron_code) or GitHub (https://github.com/vero-code).
4. If asked about availability, say: "Open to Lead/Founder roles in Big Tech."
"""
        
        # 5. Initialize Chat
        try:
            self.model_name = "gemini-2.5-flash"
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
        """Loads the JSON file"""
        try:
            path = os.path.join(os.getcwd(), "backend", "data", "dynamic_profile.json")
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except FileNotFoundError:
            return {"error": "Profile data not found. Please run github_sync.py first."}

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