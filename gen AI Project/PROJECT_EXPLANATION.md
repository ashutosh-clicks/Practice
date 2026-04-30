# GenAI Tutor — Project Explanation

## Overview

GenAI Tutor is a full-stack AI-powered learning platform where students can upload PDF study materials and interact with them through an AI tutor, auto-generated quizzes, flashcards, and revision notes. It uses **Retrieval-Augmented Generation (RAG)** to provide contextually accurate AI responses grounded in the student's own documents.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router, TypeScript) |
| **Frontend** | React 19, CSS Modules, Lucide Icons |
| **Authentication** | NextAuth.js v4 (Credentials provider, JWT sessions) |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Vector Search** | MongoDB Atlas Vector Search |
| **AI / LLM** | Google Gemini (`gemini-2.5-flash` for generation, `gemini-embedding-001` for embeddings) |
| **PDF Processing** | `pdf-parse` for text extraction |
| **UI Components** | `react-markdown`, `react-dropzone` |

---

## Project Structure

```
src/
├── app/
│   ├── (main)/                    # Authenticated pages (wrapped in layout with sidebar)
│   │   ├── page.tsx               # Dashboard — overview of all resources
│   │   ├── study-materials/       # List + detail view of uploaded PDFs
│   │   ├── tutor/                 # AI tutor chat (new session + existing sessions)
│   │   ├── quizzes/               # List + interactive quiz viewer
│   │   ├── flashcards/            # List + interactive flashcard viewer
│   │   ├── notes/                 # List + revision notes viewer
│   │   ├── friends/               # Friend system + shared resources
│   │   └── settings/              # User settings
│   ├── api/
│   │   ├── auth/                  # NextAuth endpoints + signup
│   │   ├── ai/
│   │   │   ├── tutor/route.ts     # AI tutor with RAG (vector search)
│   │   │   ├── generate-quiz/     # Quiz generation from material
│   │   │   ├── generate-flashcards/ # Flashcard generation
│   │   │   └── generate-notes/    # Revision notes generation
│   │   ├── upload/route.ts        # PDF upload + text extraction + embedding
│   │   ├── search/route.ts        # Hybrid keyword + semantic search
│   │   ├── share/route.ts         # Resource sharing between friends
│   │   └── friends/               # Friend requests, search, respond
│   ├── login/                     # Login page
│   └── signup/                    # Registration page
├── components/
│   ├── features/                  # Domain components (TutorChat, QuizViewer, etc.)
│   ├── layout/                    # Header, Sidebar, MainLayout
│   └── providers/                 # SessionProvider wrapper
├── models/                        # Mongoose schemas (8 models)
├── lib/
│   ├── mongodb.ts                 # MongoDB connection singleton
│   ├── gemini.ts                  # Gemini API client with retry + model fallback
│   └── embeddings.ts              # Text chunking + vector embedding generation
└── middleware.ts                  # Auth route protection
```

---

## Database Models

### 1. User
Stores authentication credentials.
```
{ name, email, password (bcrypt hashed), createdAt, updatedAt }
```

### 2. Material
Uploaded study documents with extracted text.
```
{ title, originalFileName, content (full extracted text), fileUrl, userId, fileType,
  sharedWith[] (array of user IDs), createdAt, updatedAt }
```

### 3. DocumentChunk (Vector Store)
Text chunks with 768-dimensional vector embeddings for semantic search.
```
{ materialId, userId, chunkIndex, content (~800 chars), embedding (number[768]),
  createdAt, updatedAt }
```
**Atlas Vector Search index** (`vector_index`) enables `$vectorSearch` aggregation on the `embedding` field with cosine similarity.

### 4. ChatSession
Conversation history for the AI tutor.
```
{ userId, materialId, title, messages[{ role, content }], createdAt, updatedAt }
```

### 5. Quiz
AI-generated multiple-choice assessments.
```
{ materialId, userId, title, sharedWith[],
  questions[{ question, options[], correctOptionIndex, explanation }], createdAt }
```

### 6. FlashcardDeck
AI-generated study flashcards.
```
{ materialId, userId, title, sharedWith[],
  cards[{ front, back }], createdAt }
```

### 7. RevisionNotes
AI-generated concise revision notes.
```
{ materialId, userId, title, sharedWith[],
  sections[{ heading, bullets[] }], createdAt }
```

### 8. Friendship
Social connections between users.
```
{ requesterId, recipientId, status (pending | accepted | declined), createdAt }
```

---

## Core Features & How They Work

### 1. PDF Upload & Processing
**Purpose:** To ingest user study materials, extract text, and prepare the content for AI-driven semantic retrieval and content generation.
**Route:** `POST /api/upload`

**Detailed Workflow:**
1. **Upload & Validation:** The user uploads a PDF file via the `UploadDocument.tsx` component. The backend verifies the file type and presence.
2. **Text Extraction:** The `pdf-parse` library reads the PDF buffer and extracts raw text. If extraction fails or yields no text, the process aborts gracefully.
3. **Storage:** The raw text, along with metadata (title, original filename), is saved in a new `Material` document in MongoDB. The physical file is saved to the local `/public/uploads/` directory for reference.
4. **Vectorization Pipeline (Background):** 
   - **Chunking:** The extracted text is passed to `chunkText()`, which breaks it into smaller, overlapping segments (~800 characters each, with a 200-character overlap). The overlap prevents context loss across chunk boundaries. It intelligently attempts to break on sentence boundaries (`. `, `? `, `! `) to maintain semantic coherence.
   - **Embedding Generation:** These chunks are sent to the Gemini API (`gemini-embedding-001`) to generate 768-dimensional vector representations.
   - **Vector Storage:** Each chunk and its corresponding embedding are saved as a `DocumentChunk` in MongoDB, linking back to the parent `Material`.

### 2. AI Tutor (RAG Pipeline)
**Purpose:** To provide an interactive, context-aware AI tutor that answers student queries strictly based on their uploaded study materials.
**Route:** `POST /api/ai/tutor`

**Detailed Workflow:**
1. **Query Embedding:** The student's latest chat message is sent to the Gemini embedding API to create a 768-dimensional query vector (`RETRIEVAL_QUERY` task type).
2. **Semantic Search (RAG):** The backend executes a `$vectorSearch` aggregation against the `DocumentChunk` collection in MongoDB Atlas. It uses cosine similarity to find the top 8 chunks whose embeddings most closely match the query vector. The search is strictly filtered by the `userId` to ensure data privacy and, optionally, by a specific `materialId`.
3. **Context Construction:** The retrieved chunks are formatted into a structured text block with relevance scores, creating a highly focused context window.
4. **Prompt Engineering:** A system prompt is assembled containing:
   - Persona instructions (expert, encouraging tutor).
   - Constraints (max 250 words, do not hallucinate outside provided text).
   - The retrieved context passages (`<STUDY_MATERIALS>`).
   - The ongoing conversation history (`<CONVERSATION_HISTORY>`).
5. **Generation & Persistence:** The prompt is sent to `gemini-2.5-flash`. The generated response is returned to the frontend and appended to the `ChatSession` document in the database to maintain conversational state.

**Why RAG?** RAG (Retrieval-Augmented Generation) prevents the LLM from hallucinating by grounding its answers in specific facts from the user's documents. By retrieving only the most relevant chunks instead of the entire document, it significantly reduces token usage, lowers latency, and improves the accuracy of the AI's response.

### 3. Quiz Generation
**Purpose:** To automatically assess the student's understanding by generating targeted multiple-choice questions from their study materials.
**Route:** `POST /api/ai/generate-quiz`

**Detailed Workflow:**
1. **Context Loading:** When initiated from the UI, the backend retrieves the full text content of the target `Material` (up to 50,000 characters to fit within token limits).
2. **Prompting for Structured Data:** A prompt is sent to the Gemini model instructing it to act as an educational AI and generate exactly 5 multiple-choice questions based on the document's core concepts. Crucially, the prompt enforces a strict JSON output format without markdown wrappers.
3. **Parsing & Validation:** The raw text response is cleaned using `cleanJsonResponse()` and parsed into a JavaScript object. The system validates that an array of questions was successfully generated.
4. **Storage:** A new `Quiz` document is created, storing the questions, options, correct answers, and explanations, linked to the `userId` and `materialId`.

### 4. Flashcard Generation
**Purpose:** To aid rote memorization by generating concise concept-definition pairs from study texts.
**Route:** `POST /api/ai/generate-flashcards`

**Detailed Workflow:**
1. **Context Loading:** Similar to quiz generation, the relevant `Material` content is fetched.
2. **Prompting:** The AI is instructed to identify 5 to 15 key concepts, terms, or facts and format them as 'front' and 'back' pairs suitable for flashcards. Strict JSON output is enforced.
3. **Storage:** After parsing and validation, a `FlashcardDeck` document is created in MongoDB, allowing the student to review them interactively via the `FlashcardViewer` component.

### 5. Revision Notes Generation
**Purpose:** To provide a condensed, easily scannable summary of a document for quick review before exams.
**Route:** `POST /api/ai/generate-notes`

**Detailed Workflow:**
1. **Context Loading:** The target `Material` content is retrieved.
2. **Prompting:** The prompt directs the AI to distill the text into 3-8 logical sections, each containing a heading and 3-7 concise bullet points. The focus is on extracting key definitions, formulas, and critical facts, outputting strict JSON.
3. **Storage:** The parsed sections are stored in a `RevisionNotes` document, presented in a structured layout on the frontend.

### 6. Search (Hybrid Vector + Keyword)
**Purpose:** To allow users to find specific study materials, quizzes, or notes using natural language or exact keywords.
**Route:** `GET /api/search?q=...`

**Detailed Workflow:**
1. **Parallel Execution:** The backend runs two search strategies simultaneously for efficiency.
2. **Semantic Vector Search:** The search query is embedded and compared against `DocumentChunk` vectors using `$vectorSearch`. This finds documents conceptually related to the query, even if exact keywords aren't present (e.g., searching "machine learning" finds documents about "neural networks"). Results are grouped by `materialId`.
3. **Keyword Search:** A case-insensitive regular expression search is executed across the `title` fields of `Material`, `FlashcardDeck`, `Quiz`, and `RevisionNotes` collections.
4. **Result Merging:** Semantic matches are prioritized and placed at the top of the results list, followed by keyword matches. Deduplication ensures materials found by both methods only appear once.

### 7. Resource Sharing
**Purpose:** To foster collaborative learning by allowing students to share generated resources with their network.
**Route:** `POST /api/share` (share) / `DELETE /api/share` (unshare)

**Detailed Workflow:**
1. **Access Control:** When a user attempts to share a resource (Material, Quiz, etc.), the system verifies they are the original owner (`userId`).
2. **Friend Verification:** The system checks that the target recipient is an accepted friend in the `Friendship` collection.
3. **Updating References:** The recipient's `userId` is added to the `sharedWith` array on the specific resource document.
4. **Visibility:** When the recipient loads their dashboard, database queries include an `$or: [{ userId: myId }, { sharedWith: myId }]` condition, making shared items visible alongside owned items.

### 8. Friends System
**Purpose:** To establish a secure network for sharing resources between specific users.
**Routes:** `/api/friends`, `/api/friends/search`, `/api/friends/respond`

**Detailed Workflow:**
1. **Discovery:** Users can search for peers using exact email addresses (to prevent spam/scraping).
2. **Request Cycle:** Sending a request creates a `Friendship` document with `status: "pending"`. A compound unique index prevents duplicate requests.
3. **Resolution:** The recipient can accept or decline. Accepting changes the status to `accepted`, enabling bidirectional sharing.
4. **Dashboard Integration:** The frontend fetches active connections to populate share dialogues and display the user's study network.


---

## Authentication Flow

```
Signup: POST /api/auth/signup
  → Validates name, email, password
  → Hashes password with bcrypt
  → Creates User in MongoDB
  → Redirects to login

Login: NextAuth Credentials Provider
  → Finds user by email
  → Compares password with bcrypt
  → Returns JWT session token
  → Session contains: { user: { id, name, email } }

Protection: middleware.ts
  → Checks for valid session on all routes except /login, /signup, /api/auth
  → Redirects unauthenticated users to /login
```

---

## Gemini Integration

### Text Generation (`src/lib/gemini.ts`)

Uses `@google/generative-ai` SDK with automatic retry and model fallback:

```
Model priority: gemini-2.5-flash → gemini-2.5-flash-preview → gemini-2.0-flash
Retry: 3 attempts per model with exponential backoff (2s, 4s, 6s)
Retryable errors: 503 (overloaded), 429 (rate limited)
```

Also includes `cleanJsonResponse()` to strip markdown code fences from JSON responses.

### Embeddings (`src/lib/embeddings.ts`)

Uses `@google/genai` SDK (newer) with `gemini-embedding-001`:

- **For documents:** `RETRIEVAL_DOCUMENT` task type, 768 dimensions (MRL truncated from 3072)
- **For queries:** `RETRIEVAL_QUERY` task type, 768 dimensions
- **Batching:** Processes 10 texts at a time with 500ms delays between batches

---

## Frontend Components

| Component | Purpose |
|-----------|---------|
| `TutorChat.tsx` | Real-time chat interface with message history, material selector, and markdown rendering |
| `QuizViewer.tsx` | Interactive quiz with option selection, scoring, and explanation reveal |
| `FlashcardViewer.tsx` | Card flip animation for studying flashcard decks |
| `UploadDocument.tsx` | Drag-and-drop PDF upload with react-dropzone |
| `MaterialActions.tsx` | Generate quiz/flashcards/notes buttons on material detail pages |
| `ShareButton.tsx` | Share resources with friends (shows friend list, share/unshare toggle) |
| `Header.tsx` | Top navigation bar with search, user menu |
| `Sidebar.tsx` | Left navigation with page links |
| `MainLayout.tsx` | Page wrapper with sidebar + content area |

---

## Environment Variables

```bash
# .env.local
MONGODB_URI="mongodb://..."          # MongoDB Atlas connection string
NEXTAUTH_SECRET="your-secret"        # JWT signing secret
NEXTAUTH_URL="http://localhost:3000"  # App URL
GEMINI_API_KEY="AIza..."             # Google Gemini API key
```

---

## How to Run

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### One-time Setup Scripts

```bash
# Create the Atlas Vector Search index (required for RAG)
node create-vector-index.js

# Generate embeddings for existing materials (if uploaded before vector search was added)
node migrate-embeddings.js
```

---

## Data Flow Summary

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER JOURNEY                                  │
│                                                                      │
│  1. Sign Up / Login                                                  │
│         ↓                                                            │
│  2. Upload PDF                                                       │
│         ↓                                                            │
│     ┌───────────────────────────────────────────┐                    │
│     │ Extract text → Store Material             │                    │
│     │ Chunk text → Embed chunks → Store vectors │                    │
│     └───────────────────────────────────────────┘                    │
│         ↓                                                            │
│  3. Study with AI Tools                                              │
│     ┌──────────────┬──────────────┬──────────────┬──────────────┐    │
│     │  AI Tutor    │  Quizzes     │  Flashcards  │  Notes       │    │
│     │  (RAG +      │  (5 MCQs    │  (5-15 cards │  (3-8        │    │
│     │  Vector      │  from        │  from        │  sections    │    │
│     │  Search)     │  content)    │  content)    │  from        │    │
│     │              │              │              │  content)    │    │
│     └──────────────┴──────────────┴──────────────┴──────────────┘    │
│         ↓                                                            │
│  4. Collaborate                                                      │
│     ┌──────────────────────────────────────┐                         │
│     │ Add Friends → Share Materials,       │                         │
│     │ Quizzes, Flashcards, Notes           │                         │
│     └──────────────────────────────────────┘                         │
└─────────────────────────────────────────────────────────────────────┘
```
