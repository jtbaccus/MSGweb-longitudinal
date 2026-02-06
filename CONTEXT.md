# MSGweb-longitudinal — Project Context

*Created: 2026-02-06*

## What This Is

Upgrade fork of [MSGweb](https://github.com/jtbaccus/MSGweb) for developing longitudinal student progress tracking. The production MSGweb repo remains untouched — all upgrade work happens here.

## Production Repo

- **Live app:** Deployed on Vercel from `jtbaccus/MSGweb`
- **GitHub:** https://github.com/jtbaccus/MSGweb
- **Submodule in turing:** `projects/msgweb/`

## Current Status

- **Phase:** Pre-implementation (Phase 1: Authentication not yet started)
- **Upgrade plan:** See `UPGRADE-PATH.md` for the full 8-phase plan

## Upgrade Phases (from UPGRADE-PATH.md)

1. Authentication (NextAuth.js + Supabase)
2. Database Schema (Prisma + PostgreSQL)
3. TypeScript Types
4. API Routes
5. State Management
6. UI Components
7. AI Summary Generation
8. Verification & Testing

## Merge-Back Strategy

When the longitudinal features are stable and tested:
- Open a PR from `jtbaccus/MSGweb-longitudinal` to `jtbaccus/MSGweb`, or
- Cherry-pick / manual merge of completed phases
- The upgrade preserves the existing single-evaluation workflow (mode toggle)

## Key Decisions

- Fork approach chosen to protect live production deployment
- Full commit history preserved from original repo
- Each phase is independently deployable (can pause after any phase)
