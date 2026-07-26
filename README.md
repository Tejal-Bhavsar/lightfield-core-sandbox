# Lightfield CRM Core Sandbox

An autonomous, AI-native CRM developer sandbox mimicking the core concepts of **Lightfield**—a platform that automatically captures, summarizes, and acts on customer interaction logs (emails, calls, meetings, Slack logs) to construct account context and sales intelligence.

Built to demonstrate advanced full-stack and AI product engineering capabilities for the **AI Product Engineer (New Grad)** role.

---

## 🛠️ Tech Stack & Architecture

*   **Frontend Framework:** React 19 (Client Components, Hooks), Next.js 16 (App Router), Tailwind CSS.
*   **API Layer:** Apollo GraphQL Server (`/api/graphql` next-handler) driving custom types, queries, and mutations.
*   **Database & ORM:** Prisma ORM with SQLite (`dev.db`) mapping relational models for Accounts, Contacts, Interactions, Memories, Opportunities, Tasks, Meetings, and Notes. Highly portable to PostgreSQL.
*   **AI Service Adapter (`src/lib/llm.ts`):** Pluggable LLM interface supporting:
    1.  **Hugging Face Serverless API** (e.g., Llama 3)
    2.  **Google Gemini API**
    3.  **Local Offline Regex/Rule Parser** (falls back gracefully if API tokens are omitted for immediate local development).

---

## 🚀 Key Feature Walkthrough

### 1. Unified Agentic Ingestion (Dashboard)
Paste unstructured client emails, Slack conversations, or raw meeting logs. The AI pipeline analyzes the content to:
*   Automatically find or create the **Account**.
*   Synthesize versioned **Account Memories** (extracting pricing, competitors, and feature requests).
*   Auto-extract **Action Items** (e.g., *"draft GDPR docs by Friday"*) and map task checklists with due dates.
*   Generate **Opportunities** when pricing/budgets are discussed.

*Includes one-click simulation templates (Vercel, Stripe, Figma) to instantly populate rich CRM records.*

### 2. Opportunities Kanban Board (`/opportunities`)
*   Visual pipeline tracking deals through 6 stages (`Lead`, `Contacted`, `Demo`, `Proposal`, `Won`, `Lost`).
*   Auto-populates and updates stage contract values from ingested budget text.
*   Features stage controllers (arrows + select dropdowns) to mutate opportunity pipeline stages and parent accounts in real-time.

### 3. Versioned Memory Hub (`/memory`)
*   Scrollable chronological timeline logs of all touchpoints for each account.
*   **Memory Version Slider (`v1`, `v2`, `v3`):** Clicking the slider lets you view how the AI CRM's summary of the account has evolved and compiled as new touchpoints were ingested.

### 4. AI Grounded Search (`/query`)
*   Chat with your CRM database in plain English (e.g., *"Any SSO requests?"*).
*   Displays real-time agent reasoning/progress traces.
*   Returns answers grounded by **clickable citation cards** linking back to database transaction ids.

### 5. HubSpot Migrator Console (`/migrate`)
*   Uploads custom database CSV logs.
*   Simulates API sync progress inside a retro developer terminal console, logging account compilation, contact updates, and opportunity creations.

### 6. Record & Resource UIs
*   **Contacts (`/contacts`):** Directory directory of customer profiles and manual creation panel.
*   **Tasks (`/tasks`):** Central dashboard tracking all checklists with status filter tabs (All, Pending, Completed).
*   **Meetings (`/meetings`):** Log timeline of transcripts with an expandable dark-theme dialog viewer.
*   **Notes (`/notes`):** Card-styled grid layout for logging quick sticky-note annotations.

---

## 🏃 Running Locally

### 1. Clone & Install Dependencies
```bash
git clone git@github.com:Tejal-Bhavsar/lightfield-core-sandbox.git
cd lightfield-core-sandbox
npm install
```

### 2. Database Migration
Set up the SQLite database and run the migrations:
```bash
npx prisma migrate dev --name init
```

### 3. Environment Setup (Optional)
Create a `.env` file in the root directory to configure API keys:
```text
DATABASE_URL="file:./dev.db"

# Pluggable LLM selection: "huggingface" or "gemini"
LLM_PROVIDER="huggingface"
HF_API_TOKEN="your_huggingface_token"
GEMINI_API_KEY="your_gemini_token"
```
*(If no tokens are set, the app will run using its local rule-based regex parsing fallback).*

### 4. Launch Development Server
```bash
npm run dev
```
Open `http://localhost:3000` to launch the landing page, and click **Enter Developer Sandbox** to access the dashboard.

---

## 🐳 Docker Deployment

To build and run the application in a local Docker container:

```bash
# Build the Docker image
docker build -t lightfield-crm-sandbox .

# Run the container
docker run -p 3000:3000 lightfield-crm-sandbox
```
The application will apply migrations and start the Next.js server, accessible at `http://localhost:3000`.
