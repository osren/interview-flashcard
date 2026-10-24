# CLAUDE.md

<!-- 候选人背景信息 - 每次会话自动加载 -->
<!-- 请在对话开始时阅读 CANDIDATE.md 了解候选人背景 -->

This file provides guidance to Claude Code when working in this repository.

## Project Overview

**InterviewFlash** is a React application for interview preparation and job-search workflows. It includes flashcards, interview records, resume tools, AI-assisted features, and campus job tracking. The browser client uses Supabase services for authentication, data synchronization, and server-side AI functions when configured; some features remain available with browser-local storage when cloud services are unavailable.

## Project Context

- React 18, TypeScript, Vite, Tailwind CSS, Zustand, and React Router DOM.
- Supabase is an active backend dependency, including database migrations and Edge Functions under `supabase/`.
- Local persistence uses a mix of `localStorage` and IndexedDB. User data synchronization is feature-specific and handled by the corresponding providers and stores.
- Package versions and executable scripts are defined in `package.json` and `pnpm-lock.yaml`.

## Repository Guidance

- `docs/engineering/` contains project engineering constraints, architecture notes, infrastructure details, and checks. Read its index and relevant rules before changing affected code.
- `docs/knowledge/` contains project context and technical reference material. Read relevant documents as needed and update them when project-wide facts change.
- `openspec/` is the sole feature/change specification workflow and source of truth for in-flight OpenSpec changes.
- `docs/specs/` contains legacy workflow records only; do not create new changes there.

## Change Workflow

- For new features and substantial behavior changes, use `/opsx:propose`, review the generated proposal/specification/design/tasks, then implement with `/opsx:apply`.
- Use `/opsx:explore` when the problem or solution needs exploration before writing a change proposal.
- Before archiving a completed change, verify the implementation against its requirements and run the relevant project checks. Use `/opsx:archive` to archive and sync the change's specifications.
- Small, clearly scoped fixes and documentation-only edits can proceed directly when a full change specification would add no value.

## Commands

```bash
pnpm dev      # Start the Vite development server
pnpm build    # TypeScript project build and production bundle
pnpm lint     # ESLint
pnpm preview  # Preview the production bundle
```

## Interview Document Import

When a new interview document is provided, follow `INTERVIEW_IMPORT_GUIDE.md`. The preferred filename format is `{公司名} - {部门/方向} - {面试轮次}.md`; preserve the source document and update the appropriate exports under `src/data/interview/`.

## Current Route Map

- `/` — Home
- `/core`, `/core/:chapterId` — Core interview flashcards
- `/projects`, `/projects/:projectId` — Project deep dives
- `/mpx`, `/mpx/:chapterId` — MPX learning cards
- `/interview`, `/interview/:companyId/:departmentId/:sessionId` — Interview records
- `/campus` — Campus job tracking
- `/resume` — Resume tools
- `/ai`, `/ai/:projectId`, `/ai/github-trending` — AI resources and GitHub Trending
- `/custom`, `/favorites`, `/llm-handbook`, `/rjsf`, `/preview/card-image` — Supporting tools

## Agent Working Principles

- Surface assumptions and meaningful tradeoffs when requirements are unclear; ask targeted questions only when the answer changes the implementation.
- Prefer the smallest change that satisfies the request. Keep unrelated refactors out of the diff.
- For multi-step work, identify concrete completion criteria and verify the result with current evidence before reporting completion.
