# MSGweb — Project Context

## Status: Deployed (Vercel)

## Overview
Next.js 16 web app for generating narrative evaluations for medical students on clinical clerkship rotations. Uses GPT-5-mini with streaming to produce strengths-only narratives based on selected Fail/Pass/Honors criteria.

## Tech Stack
- Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS
- Zustand 5 (state management)
- OpenAI API (GPT-5-mini with streaming) for narrative generation
- Vitest for unit testing

## Current Goals
- Expand clerkship templates beyond Internal Medicine (currently only IM has full criteria)
- Surgery, Pediatrics, Psychiatry, OB/GYN, Family Medicine have placeholder items

## Recent Changes
- **2026-02-05:** Merged smooth narrative streaming (warshanks PR #6)
  - Added adaptive typewriter effect for AI narrative display — buffers incoming stream and renders smoothly regardless of chunk size
  - Smooth display loop with adaptive character count based on queue size (1-10 chars per frame)
  - Files changed: `components/generate/AIGenerationView.tsx`
- **2026-02-04:** Merged collaborator PRs (warshanks)
  - Response streaming for narrative generation — text appears incrementally for better UX
  - Changed model from gpt-5.2 → gpt-5-mini with minimal reasoning
  - Fixed nested button hydration error in SectionGroup (accessibility fix)
  - Added Next/Back navigation buttons for step-through workflow
  - Added unit tests for SectionGroup and NavigationButtons components
  - Files changed: `app/api/generate-narrative/route.ts`, `components/generate/AIGenerationView.tsx`, `components/evaluation/SectionGroup.tsx`, `components/layout/NavigationButtons.tsx`
- **2026-01-28:** Added Neurology template — full 69-item evaluation (same structure as IM, `neuro-` ID prefix, `Activity` icon)
  - Files changed: `lib/data/templates.ts`, `components/templates/TemplateCard.tsx`

## Key Architectural Decisions
- Templates defined as static data in `lib/data/templates.ts` — no database needed
- All downstream components (template grid, evaluation form, narrative generation) handle templates generically
- Adding a new template only requires: (1) new entry in `defaultTemplates` array, (2) icon import if using a new icon

## Known Issues / Blockers
- Placeholder templates (Surgery, Peds, Psych, OB/GYN, FM) need real criteria from department rubrics

## Key Files
- `lib/data/templates.ts` — Clerkship evaluation criteria
- `lib/stores/evaluationStore.ts` — Zustand state
- `app/api/generate-narrative/route.ts` — OpenAI integration
- `components/evaluation/` — Evaluation workflow UI
- `components/templates/TemplateCard.tsx` — Template selection cards
