# Finclusion AI

<div align="center">
  <img src="https://img.shields.io/badge/Python-3.12-blue?logo=python" />
  <img src="https://img.shields.io/badge/FastAPI-0.115-green?logo=fastapi" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite" />
  <img src="https://img.shields.io/badge/License-MIT-yellow" />
</div>

> **⚠️ Financial Safety Disclaimer:** Finclusion AI provides educational information only. It is not regulated investment advice. All projections are estimates, not guarantees. Past performance does not predict future results. Consult a SEBI-registered investment advisor before making any investment decisions.

---

## What is Finclusion AI?

Finclusion AI is an open-source, locally runnable financial literacy application for Indian users. It integrates a FinGPT-compatible AI adapter with a FastAPI backend and a React/Vite frontend.

**Features:**
- 🤖 **AI Financial Chatbot** — Powered by FinGPT (via HuggingFace Inference API) or any OpenAI-compatible model
- 📊 **Financial Calculators** — SIP, SWP, PPF, NPS with correct compounding formulas
- 🎯 **Goal Planner** — Set and track financial goals with savings analysis
- 📰 **Financial News** — Live news with keyword sentiment analysis
- 🛡️ **Scam Checker** — Heuristic fraud detection for suspicious messages and URLs
- 📚 **Financial Lessons** — 8 structured lessons for beginners
- 🌐 **Multilingual** — Interface in 8 Indian languages

---

## Architecture

```
finclusion-ai/
  backend/                  ← Python FastAPI server
    app/
      main.py               ← App factory + CORS
      config.py             ← pydantic-settings configuration
      database.py           ← SQLAlchemy async SQLite
      api/                  ← Route handlers
        health.py, chat.py, calculators.py, news.py, fraud.py, profile.py, goals.py
      services/             ← Business logic
        ai_service.py       ← Provider dispatcher
        calculator_service.py
        fraud_service.py
        news_service.py
      models/               ← SQLAlchemy ORM models
      schemas/              ← Pydantic request/response schemas
      ai/                   ← AI adapter layer
        base.py             ← Abstract base class
        fingpt_adapter.py   ← FinGPT via HF Inference API
        hosted_adapter.py   ← OpenAI / Ollama adapter
      security/
        sanitize.py         ← Input sanitisation
    tests/                  ← pytest test suite
    requirements.txt
    .env.example
    .env                    ← Your local config (never commit)
  frontend/                 ← React + Vite frontend
    src/
      components/           ← All UI components
      api/client.js         ← Axios API client
      i18n/translations.js  ← 8 language strings
    vite.config.js          ← Proxy: /api → localhost:8000
  README.md
```

**Request flow:**
```
Browser → Vite (5173) → /api proxy → FastAPI (8000) → AI adapter → configured provider → response
```

---

## Prerequisites

| Requirement | Version | Check |
|---|---|---|
| Python | 3.12+ | `py --version` |
| Node.js | 18+ | `node --version` |
| npm | 8+ | `npm --version` |
| Git | any | `git --version` |

---

## Installation

### 1. Clone / enter the project

```powershell
cd D:\finclusion-ai
```

### 2. Backend setup

```powershell
cd backend
py -3.12 -m venv .venv
.\.venv\Scripts\pip install -r requirements.txt
```

### 3. Configure environment

```powershell
copy .env.example .env
```

Edit `backend/.env` — see [API Configuration](#api-configuration) below.

### 4. Frontend setup

```powershell
cd ..\frontend
npm install
```

---

## API Configuration

Edit `backend/.env`:

```env
# ── AI Provider ──────────────────────────────────────────
# Choose: "openai" | "fingpt" | "ollama" | "none"
AI_PROVIDER=openai

# OpenAI (get key at https://platform.openai.com/api-keys)
LLM_API_KEY=sk-...
MODEL_ID=gpt-4o-mini

# ── FinGPT via Hugging Face ──────────────────────────────
# Only when AI_PROVIDER=fingpt
# 1. Register at https://huggingface.co
# 2. Get token at https://huggingface.co/settings/tokens
# 3. Accept model license at https://huggingface.co/FinGPT/fingpt-forecaster_dow30_llama2-7b_lora
# 4. HF Pro subscription required for private gated models
HUGGINGFACE_TOKEN=hf_...
FINGPT_MODEL_ID=FinGPT/fingpt-forecaster_dow30_llama2-7b_lora

# ── Ollama (free, local) ─────────────────────────────────
# Install Ollama: https://ollama.com
# Pull a model: ollama pull llama3.2
# AI_PROVIDER=ollama
# LLM_BASE_URL=http://localhost:11434/v1
# MODEL_ID=llama3.2
# LLM_API_KEY=ollama

# ── News ─────────────────────────────────────────────────
# Free key at https://newsapi.org/register
NEWS_API_KEY=
```

**Cost:** 
- OpenAI `gpt-4o-mini` ≈ $0.15/M input tokens — 1000 chat messages ≈ $0.15
- Ollama: **completely free** (runs locally)
- FinGPT HF Inference API: HF Pro subscription ($9/month)
- NewsAPI free tier: 100 requests/day

---

## Model Selection — FinGPT

**Model chosen:** [`FinGPT/fingpt-forecaster_dow30_llama2-7b_lora`](https://huggingface.co/FinGPT/fingpt-forecaster_dow30_llama2-7b_lora)

**Why this model:**
- Official FinGPT repository model (AI4Finance-Foundation)
- Instruction-tuned for financial sentiment and forecasting tasks
- Accessible via HuggingFace Inference API without running locally
- Based on Llama 2 7B — well-documented, stable architecture

**Limitations:**
- Requires HuggingFace Pro subscription for full Inference API access
- Not a general-purpose chatbot — best for financial Q&A
- Does not natively support all 8 Indian languages

**Default fallback:** OpenAI `gpt-4o-mini` via `AI_PROVIDER=openai`

**Local FinGPT inference:** Requires 16GB+ VRAM (RTX 3080+). Not included by default.
To run locally: use `AI_PROVIDER=ollama` with a finance-tuned GGUF model via Ollama.

---

## Running the Application

### Start backend

```powershell
cd D:\finclusion-ai\backend
.\.venv\Scripts\uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Start frontend

```powershell
cd D:\finclusion-ai\frontend
npm run dev
```

### Access

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API Documentation | http://localhost:8000/docs |
| ReDoc | http://localhost:8000/redoc |

---

## API Endpoints

### Health
```
GET /api/health
```
Returns backend status, AI provider, and readiness.

### Chat
```
POST /api/chat
Body: { "message": "What is SIP?", "session_id": "optional-uuid", "language": "en" }

GET /api/chat/history?session_id=<uuid>
```

### Calculators
```
POST /api/calculators/sip
Body: { "monthly_investment": 5000, "annual_return_pct": 12, "duration_months": 120 }

POST /api/calculators/swp
Body: { "initial_investment": 500000, "monthly_withdrawal": 3000, "annual_return_pct": 8, "duration_months": 60 }

POST /api/calculators/ppf
Body: { "annual_investment": 100000, "duration_years": 15, "assumed_annual_rate_pct": 7.1 }

POST /api/calculators/nps
Body: { "monthly_contribution": 5000, "duration_years": 25, "assumed_annual_return_pct": 10 }
```

### News
```
GET /api/news?q=mutual+fund&page_size=10
```

### Fraud Check
```
POST /api/fraud/check
Body: { "text": "Guaranteed 200% returns!" }
```

### Profile
```
GET  /api/profile
PUT  /api/profile
GET  /api/profile/summary
```

### Goals
```
GET    /api/goals
POST   /api/goals
PUT    /api/goals/{id}
DELETE /api/goals/{id}
```

---

## Running Tests

```powershell
cd D:\finclusion-ai\backend
.\.venv\Scripts\python -m pytest tests/ -v
```

**Test coverage:**
- ✅ Health endpoint
- ✅ Chat with no provider (503 expected)
- ✅ Chat history
- ✅ SIP unit + API tests
- ✅ SWP unit + API tests
- ✅ PPF unit + API tests (boundary conditions)
- ✅ NPS unit + API tests
- ✅ Fraud detection unit tests
- ✅ Fraud API tests
- ✅ Empty input validation

---

## Troubleshooting

**Backend won't start:**
```powershell
# Check Python version
py --version  # Must be 3.12+

# Reinstall deps
cd D:\finclusion-ai\backend
.\.venv\Scripts\pip install -r requirements.txt
```

**Frontend shows "Backend not reachable":**
- Make sure FastAPI is running on port 8000
- Check firewall/antivirus isn't blocking the port

**AI returns "No AI provider configured":**
- Edit `backend/.env` and set `AI_PROVIDER=openai` with a valid `LLM_API_KEY`
- Or use Ollama (free): `AI_PROVIDER=ollama`, `MODEL_ID=llama3.2`
- Restart the backend after editing `.env`

**FinGPT returns 403:**
- Accept the model license at https://huggingface.co/FinGPT/fingpt-forecaster_dow30_llama2-7b_lora
- Ensure your HuggingFace token has "Read" permissions

**Port already in use:**
```powershell
# Find process on port 8000
netstat -ano | findstr :8000
# Kill it
taskkill /PID <pid> /F
```

---

## Limitations

1. **AI responses** are only as good as the configured provider. With `AI_PROVIDER=none`, the chatbot is disabled.
2. **FinGPT models** are fine-tuned for financial tasks but may not answer general questions well.
3. **Fraud detection** is heuristic-based and may miss novel scam patterns or produce false positives.
4. **News sentiment** uses keyword matching, not a full ML model (FinBERT can be plugged in later).
5. **Multilingual** interface is translated; AI multilingual support depends on the model.
6. **No authentication** — designed for local, single-user use. Do not expose to the internet.
7. **PPF/NPS rules** may change — always verify at official government websites.

---

## Licenses

- **Finclusion AI:** MIT License
- **FastAPI:** MIT
- **React:** MIT
- **FinGPT models:** Subject to Llama 2 Community License (Meta) + individual model terms
- **OpenAI API:** Commercial use per OpenAI Terms of Service
- **NewsAPI:** Subject to NewsAPI Terms of Service

---

## Credits

- [AI4Finance-Foundation/FinGPT](https://github.com/AI4Finance-Foundation/FinGPT) — FinGPT research and models
- [SEBI](https://sebi.gov.in), [RBI](https://rbi.org.in), [AMFI](https://amfiindia.com) — Official financial information sources
