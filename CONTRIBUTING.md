# Contributing to Fretodoro

Thanks for your interest in contributing! Fretodoro is a focused tool for guitarists, and contributions that keep it simple, fast, and reliable are most welcome.

## Table of Contents

- [Dev Setup](#dev-setup)
- [Project Structure](#project-structure)
- [Running the App](#running-the-app)
- [Making Changes](#making-changes)
- [Commit Style](#commit-style)
- [Submitting a PR](#submitting-a-pr)
- [Adding Translations](#adding-translations)
- [Code Conventions](#code-conventions)

---

## Dev Setup

**Prerequisites:**

- [Node.js](https://nodejs.org/) LTS
- [pnpm](https://pnpm.io/) — `npm install -g pnpm`
- [Rust](https://rustup.rs/) stable — `rustup toolchain install stable`
- [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/) for your OS (WebView, build tools)

**Install dependencies:**

```bash
pnpm install
```

---

## Project Structure

```
fretodoro/
├── src/                        # React + TypeScript frontend
│   ├── App.tsx                 # Entry — toggles ScheduleBoard ↔ PracticeRoom
│   ├── components/
│   │   ├── schedule/           # Weekly planner UI
│   │   └── practice/          # Pomodoro + metronome UI
│   ├── hooks/
│   │   ├── usePomodoroTimer.ts # Countdown timer logic
│   │   └── useMetronome.ts     # Web Audio API metronome
│   ├── store/
│   │   └── scheduleStore.ts    # Zustand store — all schedule state & Tauri calls
│   ├── i18n/
│   │   └── locales/            # en / pt-BR translation JSON files
│   └── types/                  # Shared TypeScript interfaces
├── src-tauri/
│   └── src/
│       ├── lib.rs              # Plugin registration + command handlers
│       ├── schedule.rs         # get_schedule / save_schedule / get_today_routine
│       └── pdf.rs              # PDF export via Typst
└── .github/workflows/
    └── release.yml             # Cross-platform build on tag push
```

---

## Running the App

```bash
# Full app (Vite dev server + Tauri window) — recommended
pnpm tauri dev

# Type-check + build frontend
pnpm build

# Build native installer
pnpm tauri build
```

---

## Making Changes

### Frontend (React / TypeScript)

- All schedule state lives in `src/store/scheduleStore.ts`. Components **do not** call Tauri commands directly — they call store actions.
- Use `useTranslation()` for any user-visible text. Add new keys to **both** locale files (`src/i18n/locales/en/translation.json` and `pt-BR/translation.json`).
- Styles are Tailwind utility classes only. Use DaisyUI components where they fit. No custom CSS files.
- TypeScript strict mode is enabled. Unused variables are **compile errors** — keep imports and declarations clean.

### Backend (Rust / Tauri)

- Tauri commands live in `src-tauri/src/schedule.rs` and are registered in `lib.rs`.
- Data structures mirror the TypeScript types. Keep them in sync if you change the schema.
- `schedule.json` is stored in `app_data_dir()` — never hardcode paths.
- Format new code consistently with `cargo fmt`.

---

## Commit Style

This project uses **Conventional Commits**. The changelog is generated automatically from commit messages, so please follow the format:

```
type(scope): short description
```

| Type | When to use |
|------|-------------|
| `feat` | New user-facing feature |
| `fix` | Bug fix |
| `refactor` | Code change with no behavior change |
| `docs` | Documentation only |
| `chore` | Build, tooling, dependencies |

**Examples:**

```
feat(i18n): add German translation
fix(metronome): prevent AudioContext leak on unmount
refactor(store): simplify optimistic update rollback
docs: update setup instructions for Windows
chore: upgrade daisyui to 5.6
```

- Keep the subject line under 72 characters
- Use the imperative mood ("add", not "added" or "adds")
- No period at the end

---

## Submitting a PR

1. Fork the repo and create a branch from `main`:
   ```bash
   git checkout -b feat/my-feature
   ```
2. Make your changes and test with `pnpm tauri dev`.
3. Run `pnpm build` and confirm there are no TypeScript errors.
4. Commit following the [commit style](#commit-style) above.
5. Open a pull request against `main` with a clear description of what and why.

PRs that include tests, update translations for both locales, and keep the scope focused are easiest to review and merge.

---

## Adding Translations

All user-visible strings must be translated in both locales.

1. Add the key to `src/i18n/locales/en/translation.json`
2. Add the equivalent to `src/i18n/locales/pt-BR/translation.json`
3. Use `t("your.key")` in the component via `useTranslation()`

To add a new language, copy one of the existing locale folders, translate the values, and register the new locale in `src/i18n/config.ts`.

---

## Code Conventions

- **Components** — functional only, hooks for logic, no class components
- **State** — Zustand with optimistic updates; always revert on Tauri command failure
- **IPC** — only the Zustand store calls `invoke()`; components stay decoupled from Tauri
- **Icons** — Lucide React only; keep icon sizes consistent (`size={16}` for UI, `size={24}` for featured)
- **No tests yet** — the project doesn't have a test suite yet. If you'd like to add one, open an issue first so we can align on the approach.

---

## Questions

Open a [GitHub Issue](https://github.com/toto9in/fretodoro/issues) — no question is too small.
