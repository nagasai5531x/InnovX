<p align="center">
  <img src="https://img.shields.io/badge/🛒_Cart_Rescue-AI_Powered-blueviolet?style=for-the-badge&labelColor=1a1a2e" alt="Cart Rescue" />
</p>

<h1 align="center">🛒 Cart Rescue</h1>
<h3 align="center">AI-Powered Cart Abandonment Prediction & Recovery System</h3>

<p align="center">
  <img src="https://img.shields.io/badge/Event-AI_BUILD_2026-ff6b6b?style=flat-square&logo=rocket&logoColor=white" alt="AI BUILD 2026" />
  <img src="https://img.shields.io/badge/Type-AI_%2F_ML_%2F_E--Commerce-00d2d3?style=flat-square&logo=brain&logoColor=white" alt="Project Type" />
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/React-18+-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License" />
</p>

<p align="center">
  <b>Cart Rescue</b> is an AI-based e-commerce system that analyzes customer activity, predicts cart abandonment risk, identifies the root cause, and executes profit-optimized recovery actions — all in real time.
</p>

---

## 📌 Problem Statement

Cart abandonment is one of the most common problems faced by e-commerce websites. Customers often add products to their cart but leave without completing the purchase.

**A customer may abandon their cart due to:**

| Reason | Description |
|--------|-------------|
| 💳 Payment Failure | Transaction declined or payment gateway error |
| 🚚 High Shipping Charges | Unexpected shipping costs at checkout |
| ⚠️ Checkout Problems | Complex or broken checkout flow |
| 🔍 Price Comparison | Customer comparing prices on other sites |
| 📦 Delivery Concerns | Long delivery times or unclear delivery info |
| 🏷️ Waiting for an Offer | Customer expecting a discount or sale |
| 👀 General Browsing | Just browsing, no intent to purchase |

**The core challenge:** A normal system can detect an abandoned cart, but it cannot understand *why* the customer left or determine *what action* would be most effective. Giving discounts to every customer is not a viable solution — it increases unnecessary costs and erodes margins.

> **Our project focuses on predicting the risk, understanding the reason, and selecting a suitable recovery action — maximizing conversions while protecting profit margins.**

---

## 💡 Proposed Solution

Cart Rescue uses **Machine Learning** and **AI-based agents** to analyze customer behavior and take intelligent action.

### The system follows these steps:

```
1️⃣  Collect customer session activity
2️⃣  Process the activity and create useful features
3️⃣  Predict the customer's cart abandonment risk
4️⃣  Identify the possible reason for abandonment
5️⃣  Select a suitable recovery action
6️⃣  Validate the action against business rules
7️⃣  Execute the action — or decide "Do Nothing"
8️⃣  Store the result for auditing and analytics
```

---

## 🔄 System Flow

<p align="center">
  <img src="https://chatgpt.com/backend-api/estuary/content?id=file_0000000066ec8208844eee6ecfe44650&ts=496150&p=fs&cid=1&sig=5ff4bf532c1c5768384307a9657ef4a2c8a387ff43c8d6647819e083c7b04e03&v=0" alt="Cart Rescue - System Flow" width="800"/>
</p>

The system processes each customer session through a structured pipeline:

1. **Customer Visits Website** → Session tracking begins
2. **Customer Activities** → Product views, cart events, checkout & payment tracked
3. **Session Analysis & Feature Creation** → Raw events transformed into ML features
4. **Risk Prediction** → ML model scores the abandonment probability
5. **Reason Diagnosis** → AI identifies *why* the customer may leave
6. **Recovery Decision** → Best recovery action is selected
7. **Policy Validation** → Business rules and constraints are checked
8. **Action Execution** → Notification sent (SMS, WhatsApp, Popup, Coupon) **or** Do Nothing
9. **Audit & Analytics** → Results stored, reports generated, model improved

---

## 🤖 AI Agents

Our project uses **multiple AI agents**, where each agent handles a specific part of the cart recovery pipeline:

| Agent | Role | Description |
|-------|------|-------------|
| 🔍 **Analyze** | Understand | Parses and interprets customer session activity |
| 🧠 **Predict** | Assess Risk | Determines abandonment probability and root cause |
| 🎯 **Decide** | Choose Action | Selects the optimal recovery intervention |
| 📩 **Act** | Execute | Delivers the intervention to the customer |
| 📊 **Track** | Monitor | Records results and feeds back into the system |

---

## 🧠 Machine Learning

Machine Learning is the core engine for predicting cart abandonment risk.

### Models & Libraries Used:

| Technology | Purpose |
|-----------|---------|
| **XGBoost** | Gradient boosting for high-accuracy predictions |
| **LightGBM** | Fast, efficient gradient boosting framework |
| **Scikit-learn** | Data preprocessing, model evaluation, pipelines |
| **Pandas** | Data manipulation and analysis |
| **NumPy** | Numerical computations |

### ML Pipeline:

```
Customer Data
     ↓
Data Processing
     ↓
Feature Engineering
     ↓
ML Model (LightGBM / XGBoost)
     ↓
Risk Score + Reason Classification
```

---

## 🎯 Recovery Actions

Based on the customer's behavior and identified reason, the system selects the most appropriate action:

| Action | When Used | Example |
|--------|-----------|---------|
| 🔄 **Retry Payment** | Payment failure detected | "Your payment didn't go through. Try again?" |
| 💰 **Offer COD** | Payment trust issues | "Pay on delivery available for your order!" |
| 🚚 **Offer Free Shipping** | High shipping cost concern | "Free shipping on your cart — limited time!" |
| 🏷️ **Offer Small Coupon** | Price sensitivity detected | "Here's 10% off to complete your order" |
| 🪟 **Exit Intent Popup** | Customer about to leave | Triggered popup with a compelling offer |
| 📱 **WhatsApp Reminder** | Cart idle for a period | Personalized WhatsApp message |
| 🚫 **Do Nothing** | Low ROI or no intervention needed | No action taken (cost-saving decision) |

> **Key Insight:** If the problem is a payment failure, the system suggests *Retry Payment* — not an unnecessary discount. This saves cost and addresses the actual issue.

---

## 📸 Screenshots

### 🔐 Login Page
<p align="center">
  <img src="C:/Users/kavya/OneDrive/Pictures/Screenshots/Screenshot 2026-08-08 033800.png" alt="Login Page" width="800"/>
</p>

### 📊 Control Center (Dashboard)
<p align="center">
  <img src="C:/Users/kavya/OneDrive/Pictures/Screenshots/Screenshot 2026-08-08 034100.png" alt="Dashboard - Control Center" width="800"/>
</p>

### 📈 Analytics
<p align="center">
  <img src="C:/Users/kavya/OneDrive/Pictures/Screenshots/Screenshot 2026-08-08 034150.png" alt="Analytics Dashboard" width="800"/>
</p>

---

## 📊 Dataset

The project works with e-commerce customer and session data. The important information includes:

- **Customer/Session Activity** — Browsing patterns and session metadata
- **Product Views** — Items viewed, time spent on product pages
- **Cart Events** — Add to cart, remove from cart, cart modifications
- **Checkout Events** — Checkout initiation, form interactions
- **Payment Events** — Payment attempts, failures, method used
- **Cart Value** — Total cart value, item count
- **Purchase Outcome** — Completed purchase or abandoned

This data is used to understand customer behavior and build the abandonment prediction model.

---

## 🛠️ Technologies Used

### Frontend
| Technology | Purpose |
|-----------|---------|
| ![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black) | UI Framework |
| ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) | Type Safety |
| ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white) | Build Tool |
| ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white) | Styling |
| ![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white) | Animations |
| Recharts | Data Visualization |
| Zustand | State Management |

### Backend
| Technology | Purpose |
|-----------|---------|
| ![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white) | Core Language |
| ![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white) | API Framework |
| Uvicorn | ASGI Server |
| WebSockets | Real-time Communication |
| Pydantic | Data Validation |

### Database
| Technology | Purpose |
|-----------|---------|
| ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white) | Primary Database |
| SQLAlchemy | ORM |
| AsyncPG | Async PostgreSQL Driver |
| Alembic | Database Migrations |

### AI & Machine Learning
| Technology | Purpose |
|-----------|---------|
| XGBoost | Gradient Boosting |
| LightGBM | Fast Gradient Boosting |
| Scikit-learn | ML Pipelines & Evaluation |
| Pandas | Data Processing |
| NumPy | Numerical Computing |

### DevOps & Other Tools
| Technology | Purpose |
|-----------|---------|
| ![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white) | Caching & Message Broker |
| ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white) | Containerization |
| Celery | Task Queue |
| Docker Compose | Multi-container Orchestration |
| Nginx | Reverse Proxy |
| SendGrid | Email Notifications |
| Twilio | SMS & WhatsApp |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│     Dashboard  │  Analytics  │  Risk Analysis  │  Recovery      │
└────────────────────────┬────────────────────────────────────────┘
                         │ REST API / WebSocket
┌────────────────────────┴────────────────────────────────────────┐
│                      BACKEND (FastAPI)                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Analyze  │→ │ Predict  │→ │ Decide   │→ │   Act    │       │
│  │  Agent   │  │  Agent   │  │  Agent   │  │  Agent   │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                     │                            │              │
│              ┌──────┴──────┐          ┌──────────┴──────┐      │
│              │  ML Models  │          │  Track Agent    │      │
│              │ LightGBM /  │          │  Audit & Log    │      │
│              │  XGBoost    │          └─────────────────┘      │
│              └─────────────┘                                    │
└──────────┬──────────────────────────────┬───────────────────────┘
           │                              │
    ┌──────┴──────┐                ┌──────┴──────┐
    │ PostgreSQL  │                │    Redis    │
    │  Database   │                │   Cache     │
    └─────────────┘                └─────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **Python** ≥ 3.11
- **PostgreSQL** ≥ 14
- **Redis** ≥ 7
- **Docker** & **Docker Compose** (optional)

### Quick Start with Docker

```bash
# Clone the repository
git clone https://github.com/your-username/cart-rescue.git
cd cart-rescue

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Manual Setup

#### Backend
```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start the server
uvicorn app.main:app --reload --port 8000
```

#### Frontend
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 📂 Project Structure

```
cart-rescue/
├── frontend/                 # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── stores/           # Zustand state management
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API service layer
│   │   └── utils/            # Utility functions
│   └── package.json
│
├── backend/                  # Python + FastAPI
│   ├── app/
│   │   ├── agents/           # AI Agent modules
│   │   ├── models/           # ML models & DB models
│   │   ├── api/              # API routes
│   │   ├── services/         # Business logic
│   │   ├── tasks/            # Celery async tasks
│   │   └── config/           # Configuration
│   └── requirements.txt
│
├── ml/                       # Machine Learning pipeline
│   ├── data/                 # Training data
│   ├── notebooks/            # Jupyter notebooks
│   ├── models/               # Trained model files
│   └── scripts/              # Training & evaluation scripts
│
├── docker-compose.yml        # Docker orchestration
├── nginx.conf                # Nginx configuration
├── screenshots/              # Project screenshots
└── README.md                 # This file
```

---

## 📈 Key Metrics

| Metric | Value |
|--------|-------|
| Sessions Analyzed | 14,250+ |
| Abandonment Detection Rate | 16.9% |
| Recovered Cart Value | .5K |
| Net Incremental Margin | .2K |
| Avg Decision Latency | 18.4ms |
| Policy Pass Rate | 98.5% |
| Conversion Lift | +28.4% |
| Net ROI | 38.7% |

---

## 📚 What We Learned

Through this project, we gained practical knowledge of:

- ⚛️ **Frontend Development** — React, TypeScript, Vite, Tailwind CSS
- 🐍 **Backend Development** — Python, FastAPI, WebSockets
- 🤖 **Machine Learning** — XGBoost, LightGBM, Feature Engineering
- 🧩 **AI Agents** — Multi-agent architecture and orchestration
- 🗄️ **Database Management** — PostgreSQL, SQLAlchemy, Alembic
- 🔌 **REST APIs** — API design, authentication, real-time data
- 📡 **WebSockets** — Real-time bidirectional communication
- 📊 **Data Processing** — Pandas, NumPy, data pipelines
- 🐳 **Docker & Deployment** — Containerization, Docker Compose, Nginx

> **Most importantly**, we learned how AI and Machine Learning can be applied to solve a **real-world e-commerce problem** — turning cart abandonment from a lost sale into a recovered opportunity.

---

## 👥 Project Details

| Detail | Info |
|--------|------|
| **Project Name** | Cart Rescue |
| **Project Type** | AI / Machine Learning / E-Commerce |
| **Event** | 🏆 AI BUILD 2026 |

---

<p align="center">
  <b>Built with ❤️ for AI BUILD 2026</b>
  <br/>
  <sub>🛒 Stop losing carts. Start winning margins.</sub>
</p>
