# GEMINI.md - Medical Student Grader (Longitudinal)

## Foundational Mandates (Global)
This project inherits all global mandates from the root `GEMINI.md`.

### Workflow: ACE (Research -> Plan -> Implement)
**CRITICAL:** ACE always stands for **Research -> Plan -> Implement**.
- **Research (R):** Explore the codebase, identify constraints, and understand dependencies *before* proposing a solution.
- **Plan (P):** Create a step-by-step implementation plan with verification procedures.
- **Implement (I):** Execute the plan incrementally, verifying each step.
- Follow this workflow for all complex or architectural tasks.

### Academic Integrity: ABSOLUTE GUARDRAIL
**NEVER generate substantive academic content without source material.**
- **Scaffolding only:** You may create section headings, status labels, checklists, and planning artifacts.
- **No Fabricated Content:** Do not write background paragraphs, methodology claims, results, or novelty assertions unless directly grounded in provided source material (e.g., `Protocol Manual.docx`, `CONTEXT.md`).
- **Mark Gaps:** Label empty sections as "AWAITING" and specify the required source material.

### Communication Style: Terse & Direct
- **Be Terse:** Every word should earn its place. Prefer lists over paragraphs.
- **No Filler:** Skip pleasantries, hedging, and sign-offs.
- **Jarvis-Style:** Be a competent "junior faculty / project collaborator." Flag uncertainty explicitly.
- **Absolute Paths:** Always use absolute paths for file operations to ensure reliability.

---

## Project-Specific Details

### CRITICAL: Longitudinal Branch Policy
- **DO NOT merge `feature/longitudinal-upgrade` to `main`.**
- Jon will explicitly state when he wants it merged. No agent or automated process should perform this merge.

### Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Frontend:** Tailwind CSS, Zustand (state management)
- **AI:** GPT-5.2 via OpenRouter/OpenAI API

### Build & Dev Commands
- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run lint` - Run ESLint

### AI Narrative Style Guidelines
- **Tone:** Clarity, precision, conciseness.
- **Structure:** Shorter sentences, avoid compound "and" structures.
- **Directness:** Professional and direct tone; specific observed behaviors only.
- **Content:** Strengths-only narrative comments. Do not add invented examples or any negative content.
