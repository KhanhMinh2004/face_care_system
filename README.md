# AI Skincare Recommendation System

An end-to-end AI-powered skincare recommendation system that combines **Computer Vision**, **Large Language Models (LLMs)**, and **Retrieval-Augmented Generation (RAG)** to automatically analyze facial acne, classify severity, extract skincare product information, and provide personalized skincare recommendations.

---

# Features

- Acne Detection using **YOLO11m**
- Acne Severity Classification using **EfficientNetV2B2**
- OCR-based Product Information Extraction
- RAG Chatbot for skincare consultation
- Personalized skincare recommendations
- RESTful API with FastAPI
- React frontend

---

# System Architecture

```
User Image
      │
      ▼
YOLO11m Detection
      │
      ▼
EfficientNetV2B2 Severity Classification
      │
      ▼
Recommendation Engine
      │
      ▼
RAG Chatbot
      │
      ▼
Personalized Response
```

---

# Tech Stack

## Backend

- FastAPI
- PostgreSQL
- SQLAlchemy


## Frontend

- React
- Vite
- Material UI

## Computer Vision

- YOLO11m
- EfficientNetV2B2
- OpenCV

## LLM

- Llama 3.2 3B
- PEFT (LoRA)
- Transformers
- HuggingFace

## Retrieval

- LangChain
- FAISS
- Sentence Transformers

---

# Model Training

## Acne Detection

Model

- YOLO11m

Task

- Acne Detection

Training Highlights

- Data augmentation
- Early stopping
- Best model selection using validation mAP
- SGD optimizer

Evaluation Metrics

- Precision
- Recall
- mAP50
- mAP50-95

---

## Acne Severity Classification

Model

- EfficientNetV2B2

Training Strategy

### Phase 1

Feature Extraction

- Backbone frozen
- Train classifier head only

### Phase 2

Fine-tuning

- Unfreeze backbone
- Low learning rate
- Fine-tune entire network

Evaluation Metrics

- Accuracy
- Precision
- Recall
- F1-score

---

# Retrieval-Augmented Generation

The chatbot employs a Retrieval-Augmented Generation (RAG) pipeline.

Techniques include:

- Query rewriting
- Top-K document retrieval
- FAISS vector search
- Context filtering
- Prompt engineering

Embedding Model

- all-MiniLM-L6-v2

Vector Database

- FAISS

LLM

- GEMINI

---

# Project Structure

```
backend/
frontend/
deeplearning/
notebooks/
uploads/
README.md
```

---

# Installation

Clone repository

```bash
git clone ...
```

Install backend

```bash
pip install -r requirements.txt
```

Install frontend

```bash
npm install
```

Run backend

```bash
uvicorn app.main:app --reload
```

Run frontend

```bash
npm run dev
```

---

# Required Files

The following files are excluded from Git because of their large size.

## Classification Model

```
backend/models/final_best.keras
```

## YOLO Model

```
backend/models/best.pt
```

## FAISS Vector Store

```
backend/ml/llm/vector_store/
```

---

# Future Improvements

- TensorRT inference optimization
- ONNX deployment
- Multi-language support
- Vision-Language Model integration
- Mobile deployment
- Upgrade LLM

---

# License

This project is for educational and research purposes. The project's knowledge base for RAG is drawn from credible, evidence-backed sources.