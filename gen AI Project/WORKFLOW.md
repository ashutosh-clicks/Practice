# GenAI Tutor — Engineering & Operational Workflow Document

> **Canonical Operational Blueprint** for Document Ingestion, Retrieval-Augmented Generation (RAG), Automated Generation Pipelines, Evaluation, and Lifecycle Maintenance.

---

## 1. Executive Summary & Architecture Overview

**GenAI Tutor** is a full-stack, enterprise-grade AI-powered learning platform designed around **Retrieval-Augmented Generation (RAG)**. It empowers students to upload study documents (PDFs), extract semantic knowledge, and interact dynamically via natural language chat, auto-generated quizzes, flashcards, and revision notes.

### 1.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    USER INTERFACE                                       │
│                       (Next.js 16 App Router · React 19 · CSS Modules)                  │
└────────────┬──────────────────────────────┬──────────────────────────────┬──────────────┘
             │                              │                              │
    PDF Upload / Ingest              RAG Chat Stream             Artifact Generation
             │                              │                              │
             ▼                              ▼                              ▼
┌──────────────────────────┐   ┌──────────────────────────┐   ┌──────────────────────────┐
│   Ingestion Pipeline     │   │     RAG Engine Route     │   │   Artifact Gen Routes    │
│  (/api/upload/route.ts)  │   │ (/api/ai/tutor/route.ts) │   │ (Quiz/Flashcards/Notes)  │
└────────────┬─────────────┘   └────────────┬─────────────┘   └────────────┬─────────────┘
             │                              │                              │
     PDF Parsing (pdf-parse)        Vector Search Query           Prompt Construction
     Text Chunking (~800 chars)              │                    & Structured JSON Output
             │                               │                             │
             ▼                               ▼                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                 GOOGLE GEMINI API LAYER                                 │
│        Embeddings: gemini-embedding-001  │  LLM Generation: gemini-2.5-flash            │
└────────────┬──────────────────────────────┬──────────────────────────────┬──────────────┘
             │                              │                              │
     768-dim Vector Arrays           Context Retrieval             Structured JSON/Markdown
             │                              │                              │
             ▼                              ▼                              ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                            MONGODB ATLAS VECTOR DATABASE                                │
│   Collections: Users | Materials | DocumentChunks ($vectorSearch) | ChatSessions | ...  │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core End-to-End System Workflows

---

### Workflow 1: Document Processing & Vector Ingestion Pipeline

This workflow governs how user-uploaded PDF study materials are ingested, cleaned, chunked, embedded, and indexed for semantic search.

```
[ User Uploads PDF ]
        │
        ▼
[ Validate File (Type, Size <= 10MB) ] ──(Fail)──► [ Return 400 Bad Request ]
        │ (Pass)
        ▼
[ Persist File Meta & Extract Text (pdf-parse) ]
        │
        ▼
[ Sanitize & Chunk Text ]
  • Target Chunk Size: ~800 characters (~150-200 tokens)
  • Overlap: 150 characters (preserves sentence context across splits)
  • Retain metadata: { materialId, userId, chunkIndex }
        │
        ▼
[ Generate Vector Embeddings ]
  • API: Google Gemini `gemini-embedding-001`
  • Batch processing with concurrency limit & retry logic
  • Dimensionality: 768 float array
        │
        ▼
[ Store in MongoDB DocumentChunk Collection ]
  • Fields: materialId, userId, chunkIndex, content, embedding
        │
        ▼
[ MongoDB Atlas Vector Indexing ]
  • Index Name: `vector_index`
  • Similarity Metric: Cosine
  • Dimensions: 768
        │
        ▼
[ Ingestion Complete Signal -> Update Material Status to Ready ]
```

#### Key Technical Requirements:
1. **Chunking Strategy**: Avoid splitting across code blocks, bullet points, or middle of sentences when possible. Use double-newline (`\n\n`) boundaries first, fallback to space delimiters.
2. **Error Recovery**: If embedding fails midway through chunks, retry failed chunks 3 times with exponential backoff before failing the job.
3. **Re-Ingestion Cleaning**: Always wipe existing `DocumentChunk` records for a `materialId` before re-processing an updated document.

---

### Workflow 2: Retrieval-Augmented Generation (RAG) Query Pipeline

This workflow controls how student chat queries are processed, contextualized against uploaded study materials, and answered by the AI Tutor.

```
[ Student Sends Query in Chat UI ]
        │
        ▼
[ Authenticate Session (NextAuth JWT) & Validate Payload ]
        │
        ▼
[ Generate Query Embedding ]
  • Call Gemini `gemini-embedding-001` on User Query
        │
        ▼
[ Execute Atlas Vector Search ($vectorSearch) ]
  • Index: `vector_index`
  • Filter: { userId: currentUserId, materialId: selectedMaterialId }
  • Top K: 4 to 6 most relevant chunks
  • Similarity Metric: Cosine Similarity >= 0.65 threshold
        │
        ▼
[ System & Context Prompt Construction ]
  • Inject retrieved chunks as explicit background facts
  • Enforce anti-hallucination instruction: "Answer strictly based on the context below."
  • Format message history (last 10 turns for conversational context)
        │
        ▼
[ Execute LLM Inference (Gemini 2.5 Flash) ]
  • Temperature: 0.3 (balanced accuracy and tone)
  • Max Tokens: 1024
        │
        ▼
[ Stream / Return Response to Client ]
        │
        ▼
[ Persist Chat Message in ChatSession Collection ]
```

#### System Prompt Template Standard:
```text
You are GenAI Tutor, an expert, encouraging academic assistant.
Your task is to answer the student's question accurately using ONLY the provided Document Context.

RULES:
1. Rely strictly on the facts present in the Context. Do not infer or introduce outside facts.
2. If the answer cannot be determined from the Context, state clearly: "I cannot find this information in your uploaded document."
3. Format output cleanly using GitHub-flavored Markdown (bolding, lists, code blocks).

CONTEXT FROM UPLOADED MATERIAL:
--------------------------------
{retrieved_chunks_text}
--------------------------------

STUDENT QUESTION: {user_query}
```

---

### Workflow 3: Automated Generative Artifact Pipeline (Quizzes, Flashcards, Notes)

This workflow describes the deterministic generation of structured educational assets from document materials.

```
[ User Requests Generation (e.g. Quiz / Flashcards / Revision Notes) ]
        │
        ▼
[ Fetch Complete Material Content or Top Chunks ]
        │
        ▼
[ Construct Structured JSON Prompt ]
  • Enforce Schema via Gemini JSON Mode / Prompt Formatting
        │
        ▼
[ LLM Generation Call (gemini-2.5-flash) ]
  • Temperature: 0.2 (high adherence to JSON contract)
        │
        ▼
[ Validate & Parse JSON Response ]
  • Validate array lengths, required keys, correct answer index range
  • On JSON parse fail -> Trigger single auto-retry with error feedback
        │
        ▼
[ Persist Artifact in Database (Quiz / Flashcard / Note schema) ]
        │
        ▼
[ Render Interactive UI Component (QuizViewer / FlashcardViewer) ]
```

---

## 3. Project Phase-by-Phase Development Lifecycle

| Phase | Title | Core Focus & Artifacts | Primary Stakeholder |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Requirement & Schema Definition | Define Data Models, RAG specifications, DB Schemas, API Envelopes | System Architect |
| **Phase 2** | Ingestion & Vector Infrastructure | PDF Extractor, Chunking Engine, Gemini Embeddings, Atlas Vector Search | Backend Engineer |
| **Phase 3** | RAG & Prompt Engineering | Context Assembly, Chat Session persistence, Fallback logic, Guardrails | AI Engineer |
| **Phase 4** | UI/UX & Component Architecture | Design Tokens, Theme, Accessibility, Interactive Viewers, Skeletal Loaders | Frontend Lead |
| **Phase 5** | Quality Assurance & Security | Grounding Evaluation, Injection Defense, Load Testing, Auth Scoping | Security / QA |
| **Phase 6** | Observability & Operations | Token Analytics, Rate Limiting, Index Maintenance, Model Migrations | DevOps / AI Ops |

---

## 4. Operational Standard Operating Procedures (SOPs)

### SOP-1: Handling Vector Index Drift & Re-Indexing

When model embedding algorithms update or MongoDB vector indices require recreation:
1. **Prepare New Index**: Create `vector_index_v2` in MongoDB Atlas with revised dimensions or distance metrics.
2. **Execute Re-embedding Script**: Run `node migrate-embeddings.js` with batch size of 50 chunks per batch.
3. **Verify Integrity**: Run `node check-db.js` to confirm document chunk counts match total raw documents.
4. **Cutover**: Update RAG query route `api/ai/tutor/route.ts` to reference `vector_index_v2`.
5. **Clean Up**: Drop legacy `vector_index`.

---

### SOP-2: Gemini Rate-Limit & Fallback Management

1. **Error Detection**: Catch `429 Too Many Requests` or `503 Service Unavailable` from `@google/genai`.
2. **Exponential Backoff**: Retry 3 times (`1s`, `2s`, `4s`).
3. **Model Fallback Cascade**:
   - Primary: `gemini-2.5-flash`
   - Secondary Fallback: `gemini-1.5-flash` or `gemini-1.5-pro`
4. **User Communication**: If all retries fail, return standard JSON response:
   ```json
   {
     "error": "AI Service Temporarily Busy",
     "message": "The AI model is currently at maximum capacity. Please wait a moment and try again.",
     "code": "RATE_LIMIT_EXCEEDED"
   }
   ```

---

### SOP-3: Security & Prompt Injection Mitigation

1. **Input Sanitization**: Strip dangerous control tokens or multi-shot override markers (`SYSTEM:`, `[OVERRIDE]`) from student queries.
2. **Strict Boundary Placement**: Place context inside unambiguous delimiter tags (`<document_context>` ... `</document_context>`).
3. **Ownership Enforcer**: Ensure every `$vectorSearch` and database query explicitly filters by `userId: session.user.id`. Cross-user data leakage is strictly prohibited.

---

## 5. Quality Assurance & Evaluation Framework

### 5.1 RAG Evaluation Metrics

| Metric | Target Standard | Measurement Method |
| :--- | :--- | :--- |
| **Context Retrieval Precision** | > 85% top-4 relevance | Evaluation dataset of 50 sample study questions |
| **Grounding / Faithfulness** | > 95% facts directly cited | Automated check for hallucinated external entities |
| **Latency (First Token)** | < 1.2s | Client performance tracing |
| **JSON Schema Adherence** | 100% valid parse | Automated unit tests on `generate-quiz` and `generate-flashcards` |

### 5.2 Verification Checklist

- [ ] PDF upload successfully processes multi-page documents without timing out.
- [ ] Non-PDF file extensions are cleanly rejected with a clear user message.
- [ ] RAG queries properly isolate data between different users.
- [ ] Interactive Quiz Viewer scores answers accurately and provides contextual explanations.
- [ ] Dark mode and mobile navigation comply with accessibility standards (WCAG 2.1 AA).

---

## 6. Document Metadata

- **Document Version**: 1.0.0
- **Target Repository**: `gen AI Project`
- **Primary AI Provider**: Google Gemini API (`gemini-2.5-flash`, `gemini-embedding-001`)
- **Database**: MongoDB Atlas Vector Search
- **Last Updated**: August 2026
