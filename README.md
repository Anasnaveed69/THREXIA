<div align="center">

<img src="https://img.shields.io/badge/THREXIA-AI%20Threat%20Intelligence-red?style=for-the-badge&logo=shield&logoColor=white" alt="THREXIA"/>

# THREXIA
### AI-Based Insider Threat Detection & Security Dashboard

*Detect what humans miss before it becomes a crisis.*

[![Python](https://img.shields.io/badge/Python-3.9%2B-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.x-F7931E?style=flat-square&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![Pandas](https://img.shields.io/badge/Pandas-2.x-150458?style=flat-square&logo=pandas&logoColor=white)](https://pandas.pydata.org/)
[![Jupyter](https://img.shields.io/badge/Jupyter-Notebook-F37626?style=flat-square&logo=jupyter&logoColor=white)](https://jupyter.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![University](https://img.shields.io/badge/FAST--NU-Lahore-00558C?style=flat-square)](https://nu.edu.pk/)

</div>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Datasets](#-datasets)
- [ML Models & Results](#-ml-models--results)
- [Functional Requirements](#-functional-requirements)
- [User Roles](#-user-roles)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)
- [Team](#-team)
- [Acknowledgements](#-acknowledgements)

---

## 🔍 Overview

**THREXIA** is an end-to-end AI-powered threat intelligence platform built to detect insider threats and anomalous user behaviour within organizational system logs. It combines machine learning-based anomaly detection with an intuitive, role-based web dashboard — making cybersecurity analysis accessible to both seasoned analysts and non-technical stakeholders.

The system ingests raw activity logs (login events, file access, device usage, web activity, and email records), preprocesses them automatically, and runs trained anomaly detection models to surface suspicious patterns in real time.

> 🏫 Developed as a multi-course capstone project at the **National University of Computer and Emerging Sciences (FAST-NU), Lahore** — integrating Artificial Intelligence, Software Engineering, and Human-Computer Interaction disciplines.

---

## ❗ Problem Statement

Modern organizations generate massive volumes of system logs from daily user activities — logins, file transfers, device connections, browsing, and email. Manually reviewing these logs to identify insider threats is:

- ⏳ **Extremely time-consuming** for security analysts
- 🧩 **Error-prone** due to the scale and complexity of the data
- 📉 **Inaccessible** for students and smaller organizations due to the steep learning curve of enterprise SIEM/UEBA tools

THREXIA addresses this gap by automating the detection pipeline and presenting findings through a clean, explainable interface — without requiring deep cybersecurity expertise to operate.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔐 **Secure Authentication** | JWT-based login with account lockout after 3 failed attempts |
| 👥 **Role-Based Access Control** | Separate dashboards and permissions for Admin, Analyst, and Manager roles |
| 📁 **Log File Upload** | Upload system logs in **CSV** or **JSON** format for automated analysis |
| ⚙️ **Auto Preprocessing** | Cleans, normalizes, and feature-engineers raw log data automatically |
| 🤖 **AI Threat Detection** | Isolation Forest & One-Class SVM detect deviations from normal behaviour |
| 🎯 **Risk Scoring** | Every detected anomaly is assigned a numerical risk severity score |
| 🔔 **Real-Time Alerts** | Instant notifications for high-risk threats on the analyst dashboard |
| 📊 **Interactive Dashboard** | Visual charts, timelines, and heatmaps for both real-time and historical data |
| 🧠 **Explainable AI** | Human-readable threat summaries with confidence scores and recommended actions |
| 📄 **Report Export** | Download detailed threat analysis reports in **PDF** or **CSV** format |
| 📱 **Responsive UI** | Fully adaptive layout for desktop, tablet, and mobile devices |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        THREXIA System                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   [ User / Analyst ]                                        │
│          │                                                  │
│          ▼                                                  │
│   ┌─────────────┐    Upload     ┌──────────────────────┐   │
│   │  Web UI /   │──────────────▶│   Log Ingestion &    │   │
│   │  Dashboard  │               │   Validation Layer   │   │
│   └─────────────┘               └──────────┬───────────┘   │
│          ▲                                 │               │
│          │                                 ▼               │
│   ┌──────┴──────┐               ┌──────────────────────┐   │
│   │   Alerts &  │◀──────────────│   Preprocessing      │   │
│   │   Reports   │               │   Pipeline           │   │
│   └─────────────┘               │   (Clean → Normalize │   │
│                                 │    → Feature Extract) │   │
│                                 └──────────┬───────────┘   │
│                                            │               │
│                                            ▼               │
│                                 ┌──────────────────────┐   │
│                                 │  ML Anomaly Detection │   │
│                                 │  ┌──────────────────┐ │   │
│                                 │  │ Isolation Forest │ │   │
│                                 │  └──────────────────┘ │   │
│                                 │  ┌──────────────────┐ │   │
│                                 │  │  One-Class SVM   │ │   │
│                                 │  └──────────────────┘ │   │
│                                 └──────────┬───────────┘   │
│                                            │               │
│                                            ▼               │
│                                 ┌──────────────────────┐   │
│                                 │  Risk Scoring &       │   │
│                                 │  Threat Storage (DB)  │   │
│                                 └──────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Backend & Deployment
| Tool | Purpose |
|---|---|
| `Python 3.9+` | Core programming language |
| `FastAPI` | High-performance REST API for serving ML predictions |
| `Uvicorn` | ASGI server for production-grade deployment |

### Frontend & UI
| Technology | Purpose |
|---|---|
| `React 19` | Modern UI library for the intelligence dashboard |
| `Vite 8` | Next-generation frontend tooling for fast development |
| `Tailwind CSS` | Utility-first styling with complex glassmorphism effects |
| `Framer Motion` | Advanced micro-animations and smooth transitions |
| `Recharts` | Dynamic data visualization for system activity statistics |
| `Lucide Icons` | Consistent and professional iconography |

---

## 📦 Datasets

THREXIA was trained and evaluated on two insider threat datasets:

### 1. 🏢 Insider Threat Dataset for Corporate Environments *(Selected for Deployment)*
> **Source:** [Kaggle — ahmeduzaki](https://www.kaggle.com/datasets/ahmeduzaki/insider-threat-dataset-for-corporate-environments)

Structured employee activity records simulating insider threat behaviour in corporate systems — login events, file operations, system usage patterns, and more.

**Why this dataset was selected:** After comparative evaluation, this dataset yielded superior model performance across Accuracy, Precision, Recall, and F1-Score metrics compared to the CERT dataset.

### 2. 🔬 CERT Insider Threat Test Dataset *(Research Reference)*
> **Source:** [Kaggle — mrajaxnp](https://www.kaggle.com/datasets/mrajaxnp/cert-insider-threat-detection-research)

Created by the CERT Division at Carnegie Mellon University. Contains labelled simulated logs including:

| File | Contents |
|---|---|
| `logon.csv` | Login and logout activity |
| `device.csv` | Device connection events |
| `http.csv` | Web browsing activity |
| `email.csv` | Email communication logs |
| `file.csv` | File access and transfer records |

---

## 🤖 ML Models & Results

Two unsupervised anomaly detection models were trained and evaluated on a **stratified 80/20 train/test split** with 5-fold cross-validation.

### Performance Scorecard *(Hold-Out Test Set)*

| Metric | Isolation Forest | One-Class SVM |
|---|:---:|:---:|
| **Accuracy** | 92.07% | **93.62%** ✅ |
| **Precision** | 25.65% | **40.30%** ✅ |
| **Recall** | 24.90% | **38.37%** ✅ |
| **F1-Score** | 25.27% | **39.31%** ✅ |
| **ROC-AUC** | **78.70%** ✅ | 72.50% |

> **Winner: One-Class SVM** — outperforms Isolation Forest on all primary detection metrics. The Isolation Forest leads only on ROC-AUC, indicating stronger overall discrimination capability but lower precision in production thresholds.

### Model Hyperparameters

**Isolation Forest**
```python
IsolationForest(
    n_estimators=200,
    contamination=CONTAMINATION,   # matched to dataset's actual anomaly fraction
    max_samples="auto",
    random_state=42,
    n_jobs=-1
)
```

**One-Class SVM**
```python
OneClassSVM(
    kernel="rbf",
    nu=CONTAMINATION,   # upper bound on outlier fraction
    gamma="scale"
)
```

### Saved Artifacts
After training, the following files are persisted and used by the FastAPI backend:
```
backend/models/
├── threxia_model.joblib   # Best trained model (One-Class SVM)
└── threxia_scaler.joblib  # Fitted StandardScaler for data normalization
```

---

## 📋 Functional Requirements

<details>
<summary><b>Click to expand all 10 functional requirements</b></summary>

1. **User Registration** — Admins can create accounts for analysts and personnel
2. **User Authentication** — Secure login with session tokens; lockout after 3 failed attempts
3. **Role-Based Access Control** — Module access restricted by user role; direct URL access blocked
4. **Log File Upload** — Supports CSV and JSON formats with size and format validation
5. **Log Preprocessing** — Automated pipeline: deduplication → null removal → normalization → feature extraction
6. **AI-Based Threat Detection** — ML models identify deviations from established behavioural baselines
7. **Risk Score Generation** — Each detected anomaly receives a numerical severity score
8. **Threat Alert Notification** — Real-time dashboard alerts for high-risk detections
9. **Dashboard Visualization** — Interactive charts and graphs for real-time and historical analytics
10. **Report Generation** — Exportable threat analysis reports in PDF and CSV formats

</details>

---

## 👤 User Roles

```
┌─────────────────────┬──────────────────────────────────────────────────────┐
│ Role                │ Capabilities                                         │
├─────────────────────┼──────────────────────────────────────────────────────┤
│ 🔑 Administrator    │ Full system access, user management, log uploads,    │
│                     │ system configuration, all reports                    │
├─────────────────────┼──────────────────────────────────────────────────────┤
│ 🔍 Security Analyst │ View alerts, investigate anomalies, generate reports,│
│                     │ access threat detail panels                          │
├─────────────────────┼──────────────────────────────────────────────────────┤
│ 📈 IT Manager /     │ View summarized dashboards, risk-level overviews,    │
│    Supervisor       │ read-only threat reports for decision-making         │
├─────────────────────┼──────────────────────────────────────────────────────┤
│ 🎓 Student /        │ Interact with simulated log data, explore detection  │
│    Researcher       │ concepts in a sandboxed academic environment         │
└─────────────────────┴──────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
THREXIA/
│
├── 📓 BCS-D-17_THREXIA.ipynb      # Main ML research and model training
│
├── 📂 backend/                     # FastAPI Prediction Engine
│   ├── main.py                     # API endpoints & log simulation
│   ├── models/                     # Production model artifacts
│   │   ├── threxia_model.joblib
│   │   └── threxia_scaler.joblib
│   └── requirements.txt             # Backend dependencies
│
├── 📂 frontend/                    # React + Vite Intelligence Dashboard
│   ├── index.html                  # App entry point
│   ├── src/                         # React components & pages
│   ├── public/                      # Static assets (logo, icons)
│   └── package.json                 # Frontend dependencies
│
├── 📂 machine_learning/            # Research & Notebooks
│
├── 📂 docs_and_design/             # Project documentation & design assets
│   ├── SRS.docx                    # Software Requirements Specification
│   ├── SE_Proposal.pdf             # HCI Project Proposal
│   └── Threxia project Proposal.pdf # AI Project Proposal
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.9 or higher
- pip package manager
- A Kaggle account (for dataset download)

### 1. Clone the Repository

```bash
git clone https://github.com/Anasnaveed69/THREXIA.git
cd THREXIA
```

### 2. Install Dependencies

```bash
pip install pandas numpy scikit-learn matplotlib seaborn joblib imbalanced-learn kagglehub
```

Or install all at once:

```bash
pip install -r requirements.txt
```

### 3. Configure Kaggle API

```bash
# Place your kaggle.json credentials in:
~/.kaggle/kaggle.json

# Or authenticate via kagglehub in the notebook:
import kagglehub
kagglehub.login()
```

### 4. Running the Project

#### Start Backend
```bash
cd backend
# Create virtual environment (optional)
python -m venv venv
source venv/bin/activate # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python main.py
```

#### Start Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 Deployment

The trained model artifacts are consumed by a **FastAPI** backend.

```python
# Example: Loading saved model for prediction in backend/main.py
import joblib

model  = joblib.load("models/threxia_model.joblib")
scaler = joblib.load("models/threxia_scaler.joblib")

# Prediction logic
scaled_input = scaler.transform(raw_features)
prediction = model.predict(scaled_input) # -1 = threat, 1 = normal
```

**Planned future extensions:**
- Real-time log streaming via WebSockets
- Integration with live enterprise environments
- Advanced deep learning models (Autoencoders, LSTMs)
- SIEM/UEBA platform integration hooks

---

## 👨‍💻 Team

**BCS-6D | Department of Computer Science**
**FAST-NU, Lahore, Pakistan**

| Name | Roll Number |
|---|---|
| Anas Naveed Butt | 23L-0764 |
| Muhammad Usman Saboor | 23L-0813 |
| Ibrahim Rashid | 23L-0741 |
| Mohib Ali Khattak | 23L-0763 |

---

## 🙏 Acknowledgements

- **CERT Division, Carnegie Mellon University** — for the CERT Insider Threat Test Dataset
- **Ahmed Uzaki (Kaggle)** — for the Corporate Insider Threat Dataset
- **FAST-NU, Lahore** — Department of Computer Science, for academic guidance and support
- Course instructors for **Artificial Intelligence**, **Software Engineering**, and **Human-Computer Interaction**

---

<div align="center">

**THREXIA** — *Turning raw logs into actionable intelligence.*

Made with ❤️ at FAST-NU Lahore · 2025–2026

</div>
