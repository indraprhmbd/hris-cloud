# HRIS Cloud

HRIS Cloud is an advanced AI-powered Human Resource Information System (HRIS) designed to streamline the recruitment process. It features automated candidate scoring, multi-tenant organization management, and customizable career pages.

## Core Features

- **AI Candidate Scoring**: Automatically extracts text from CVs (PDF/Text) and generates scores and reasoning using AI agents.
- **Priority Inbox**: Smart dashboard that prioritizes high-scoring candidates for immediate review.
- **Multi-Tenant Architecture**: Manage multiple organizations and projects from a single HR account.
- **Customizable Career Pages**: Choice of multiple visual templates (Modern Tech, Classic Corporate, Creative Startup) with dynamic content management.
- **Automated Notifications**: Integration with Resend for sending decision emails (Approve/Reject) directly to applicants.
- **Blind Review Mode**: Toggle to hide candidate personal data to reduce bias during the initial scoring phase.

## Tech Stack

- **Frontend**: Next.js (React), Tailwind CSS, Lucide Icons.
- **Backend**: FastAPI (Python), Uvicorn.
- **AI Agent**: LangGraph/LangChain, Groq (Llama 3).
- **Database**: Supabase (PostgreSQL) with Row Level Security (RLS).
- **Deployment**: Vercel (Frontend), Hugging Face Spaces (Backend/Docker).
- **Email**: Resend API.

## Project Structure

```text
├── backend/            # FastAPI application logic and Docker configuration
├── frontend/           # Next.js web application
├── schema.sql          # Primary database schema
├── security.sql        # Row Level Security (RLS) policies
└── Dockerfile          # Root Dockerfile for Hugging Face deployment
```

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.9+
- Supabase Account
- Resend API Key
- Groq API Key

### Environment Setup

Create `.env` files in both `backend/` and `frontend/` directories following the structure provided in the documentation.

### Installation

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
python -m venv venv
source venv/bin/activate  # venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

## Deployment

The system is designed for a hybrid deployment:

- Push the repository to GitHub.
- Connect the root directory to Vercel for Frontend deployment.
- Connect the root directory to Hugging Face Spaces for Backend deployment (uses root Dockerfile).

## License

Proprietary. All rights reserved.
