# Architecture

This document describes the high-level architecture of the **Source Persona** project.

## System Overview

Source Persona is an autonomous Digital Twin deployed on Google Cloud Run. It utilizes a RAG (Retrieval-Augmented Generation) architecture to fetch user data from GitHub and synthesize personalized responses using Google Gemini 2.5.

```mermaid
graph TD
    subgraph Client ["Client Side"]
        UI["Web UI (Cyberpunk HUD)"]
        JS[script.js]
        CSS[styles.css]
    end

    subgraph Cloud ["Google Cloud Run"]
        API["FastAPI Backend"]
        RAG["RAG Engine"]
        GeminiClient["Gemini Client"]
    end

    subgraph External ["External Services"]
        GitHub["GitHub API"]
        Gemini["Google Gemini 2.5 Flash"]
    end

    UI <--> JS
    JS <--> API
    API <--> RAG
    API <--> GeminiClient
    RAG <--> GitHub
    GeminiClient <--> Gemini
```

## Components

- **Frontend:** A futuristic Cyberpunk/Glassmorphism AI HUD built with vanilla JS/CSS.
    
- **Backend:** FastAPI service hosted on Google Cloud Run.
    
- **RAG Engine:** Parses the repository code and READMEs to build the context memory.
    
- **AI Core:** Google Gemini 2.5 Flash serves as the cognitive engine for generating persona-based answers.
