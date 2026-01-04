# 🤖 Source Persona // AI Digital Twin
![Gemini 2.5 Flash](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-8E75B2?style=for-the-badge&logo=googlebard) ![Google Cloud Run](https://img.shields.io/badge/Deploy-Google%20Cloud%20Run-4285F4?style=for-the-badge&logo=googlecloud) ![Docker](https://img.shields.io/badge/Container-Docker-2496ED?style=for-the-badge&logo=docker) ![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge) 

**An Autonomous AI Digital Twin representing the next generation of developer portfolios.** 

> 🏆 Submission for the "New Year, New You Portfolio Challenge" by Google AI


## 🚀 Overview
**Source Persona** is a futuristic, neuro-symbolic framework designed to transform a traditional static portfolio into an **interactive AI Digital Twin**. It allows recruiters and collaborators to skip the resume and talk directly to an intelligent agent trained on a developer's specific project data and technical philosophy.

Powered by **Google Gemini 2.5 Flash**, the system uses **RAG (Retrieval-Augmented Generation)** to ground its responses in factual experience rather than hallucinations.

> **Live Demo Context:** This specific deployment is configured to represent **Veronika Kashtanova** (AI Engineer & Founder), demonstrating how the engine processes real-world projects history, technical skills, and professional context.


## ✨ Key Features

* **🗣️ Neuro-Symbolic Interaction:** Unlike static text, the avatar engages in a natural, multi-turn conversation, adapting its tone to the user's questions.
* **🧠 Fact-Based Reasoning (RAG):** The system connects generative AI with a structured "Memory File" (`dynamic_profile.json`). It doesn't just invent; it cites specific projects, hackathons, and dates from developer's real experience.
* **🎭 Adaptive Persona System:** The AI is prompted to mimic the specific communication style of a Senior Engineer—professional, concise, and visionary—avoiding generic "robot" answers.
* **👁️ Immersive Cyberpunk UX:** A "No-Framework" approach to UI, delivering a cinematic visual experience (simulated terminal, glassmorphism) that performs instantly on any device.


## 🛠️ Tech Stack

* **AI Model:** Google Gemini 2.5 Flash (via Google GenAI SDK).
* **Prompt Engineering & Testing:** Google **AI Studio** (Used for system instruction tuning and few-shot example generation).
* **IDE & Dev Environment:** Google **Antigravity**.
* **Backend:** Python 3.10, FastAPI, Uvicorn.
* **Frontend:** Vanilla HTML5, CSS3 (Custom FUI Design System), JS.
* **Deployment:** Docker, Google Cloud Run (Serverless).


## 📥 Getting Started

### Prerequisites
* **System:** Python 3.10+ or Docker installed.
* **Keys:** A [Google AI Studio API Key](https://aistudio.google.com/).
* *(Optional)*: A GitHub Token (if you want the agent to read your repositories live).

### 1. Clone the repository
```bash
git clone https://github.com/vero-code/source-persona.git
cd source-persona
```

### 2. Configuration

Create a `.env` file and add your keys:
```bash
GITHUB_TOKEN=your_token_here
GEMINI_API_KEY=your_api_key_here
```

### 3. Run the Application

You can run the digital twin using **Docker** (Recommended for stability) or **Python** (for development).

#### Option A: Run with Docker (Recommended)

This replicates the exact Google Cloud Run environment.

```bash
# 1. Build the container
docker build -t source-persona .

# 2. Run on port 8080
docker run -p 8080:8080 --env-file .env source-persona
```

*Visit `http://localhost:8080` to initialize the Neural Interface.*


#### Option B: Run Locally (Python)

Useful for code inspection and rapid development.

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Start the server
python backend/app/main.py
```

*Visit `http://localhost:8000` to interact with the Source Persona.*


## 🎯 The "New Year, New You" Vision

In 2026, personal branding is moving beyond static pages. This project demonstrates how AI can bridge the gap between high-level engineering and personal representation, creating a **"New You"** that is always online, always interactive, and powered by the cutting edge of Google's AI models.

**Created by [Veronika Kashtanova](https://github.com/vero-code)** for the Google AI Challenge 2026.


## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.