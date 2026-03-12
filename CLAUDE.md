# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Fretodoro** is a Tauri desktop app for guitar practice tracking. It combines a weekly schedule board with a Pomodoro-style practice room featuring a metronome. Built with React 19 + TypeScript frontend and Rust/Tauri backend.

## Commands

**Package manager:** pnpm

```bash
# Development (starts Vite dev server + Tauri window)
pnpm tauri dev

# Build native app
pnpm tauri build

# Frontend-only (no Tauri window, for UI iteration)
pnpm dev

# Type-check
pnpm build   # runs tsc && vite build
```

There are no tests configured yet (planned for Phase 5).

## Architecture

### Two-Screen Model

`App.tsx` toggles between two modes via `isPracticing` state:
- **ScheduleBoard** — weekly drag-and-drop schedule configuration
- **PracticeRoom** — active practice session with Pomodoro timer and metronome

### Frontend → Backend IPC

Tauri commands in `src-tauri/src/lib.rs`:
- `get_schedule()` — reads `schedule.json` from app data dir
- `save_schedule(schedule)` — serializes and writes schedule to disk
- `get_today_routine()` — returns today's routine based on system weekday

The Zustand store (`src/store/scheduleStore.ts`) proxies all Tauri calls. It uses **optimistic updates** (update UI immediately, revert on Tauri command failure) and tracks `lastDeleted` for undo support.

### State Management

All schedule state lives in the Zustand store. Components call store actions; they don't invoke Tauri commands directly. The store ensures the full Mon–Sun week is always present and generates UUIDs for new blocks on the frontend via `crypto.randomUUID()`.

### Key Hooks

- `usePomodoroTimer` (`src/hooks/usePomodoroTimer.ts`) — countdown via `setInterval`, manages running/paused/finished states
- `useMetronome` (`src/hooks/useMetronome.ts`) — Web Audio API oscillator at 880 Hz, BPM range 30–300, cleans up AudioContext on unmount

### Persistence

JSON file stored in Tauri's `app_data_dir()` as `schedule.json`. No database — single-user desktop app scope.

### i18n

i18next with pt-BR and en locales (`src/i18n/locales/`). Language preference persists via `tauri-plugin-store` (`settings.json`). Falls back to `localStorage` outside Tauri.

### Styling

Tailwind CSS 4 + DaisyUI 5. No CSS modules; all styles are inline utility classes.

## TypeScript Config

Strict mode with `noUnusedLocals` and `noUnusedParameters` enabled — unused variables are compile errors.
