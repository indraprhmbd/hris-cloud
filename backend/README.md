---
title: HRIS Cloud Backend
emoji: 🚀
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
---

# HRIS Cloud Backend (AI Recruitment Engine)

This is the FastAPI backend for HRIS Cloud, running in a Docker container.

## Deployment Info

- SDK: Docker
- Port: 7860
- Framework: FastAPI

## Environment Variables Required

Ensure the following are set in the Space settings:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `GROQ_API_KEY`
- `RESEND_API_KEY`
