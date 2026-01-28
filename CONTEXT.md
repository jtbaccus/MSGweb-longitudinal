# MSGweb — Project Context

## Status: Deployed (Vercel)

## Overview
Next.js 14 web app for generating narrative evaluations for medical students on clinical clerkship rotations. Uses GPT-5.2 to produce strengths-only narratives based on selected Fail/Pass/Honors criteria.

## Tech Stack
- Next.js 14 (App Router), TypeScript, Tailwind CSS
- Zustand (state management)
- OpenAI API (GPT-5.2) for narrative generation

## Current Goals
- Expand clerkship templates beyond Internal Medicine (currently only IM has full criteria)
- Surgery, Pediatrics, Psychiatry, OB/GYN, Family Medicine have placeholder items

## Recent Changes
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
