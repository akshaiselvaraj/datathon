# KAVERI: Crime Analytics & Intelligence Platform
### Karnataka State Police | State Crime Records Bureau

KAVERI (Karnataka AI for Violence, Evidence, and Risk Intelligence) is an intelligent conversational AI and crime analytics platform built for the Karnataka State Police. It assists senior investigators, intelligence analysts, and policymakers in identifying patterns, assessing risk scores, mapping criminal networks, and surfacing crime clusters.

## Project Structure

- `frontend/`: React + Vite web dashboard. Fully styled with formal NIC-standard government design guidelines.
- `backend/`: Serverless HTTP functions and cron jobs for Zoho Catalyst.
  - `chat`: Multi-lingual RAG pipeline using Pinecone vector index and Groq/Gemini APIs.
  - `graph`: Neo4j graph analyzer.
  - `analytics`: Metric aggregator.
  - `alerts`: Cron anomaly alert engine.
  - `translate`: Kannada translation router.
- `data/`: Python scripts for generating 5000+ synthetic criminal records and uploading them to Pinecone, Neo4j, and the Catalyst DataStore.
- `ml/`: Python risk scoring engine training a Random Forest model.

## Setup Instructions

1. **Backend & Frontend Packages**: Install dependencies under `frontend/` and each function in `backend/functions/`.
2. **Database Setup**: Set up free-tier Neo4j Aura and Pinecone databases. Run offline scripts under `data/` to load mock data.
3. **ML Model**: Run `python ml/train_risk_model.py` to engineer offender features and generate risk ratings.
4. **Run Frontend**: Execute `npm run dev` in `frontend/`.
