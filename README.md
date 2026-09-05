# Odómetro Humano

**Odómetro Humano** is a lightweight Spanish-language web experience that turns age and lifestyle answers into a playful "human mileage" score.

The concept uses a vehicle-maintenance metaphor: your chronological age is converted into an estimated reference mileage and a questionnaire adjusts the picture according to preventive care, movement, recovery, mental load, exposure, and medical history.

> **Important:** this is an entertainment / self-reflection tool, not a medical diagnostic system. Its score is heuristic and must not be interpreted as life expectancy, disease risk, or medical advice.

## Current functionality

- Age input and human-kilometre reference calculation.
- 26 questionnaire steps grouped into six areas:
  - Mantenimiento
  - Movimiento
  - Recuperación
  - Carga mental
  - Exposición
  - Historial
- Conditional questions, including skipping follow-up questions when they are not applicable.
- Examples and explanatory hints for potentially ambiguous questions.
- Category-level scoring.
- Overall status such as `MOTOR CUIDADO`, `EN RUTA`, or `PIDE UNA PUESTA A PUNTO`.
- Fully client-side questionnaire state in the current implementation.

## Scoring concept

The current reference value is:

```text
reference kilometres = age × 5,000 km/year
```

Each answer contributes a small adjustment factor. Category scores are normalised to a 0–100 range and the UI translates the resulting value into a simple status.

The scoring model is deliberately transparent and deterministic. It is **not** a clinically validated model and should not be presented as one.

## Technology

- **Next.js:** 15.5.x
- **React:** 19.1.x
- **TypeScript:** 5.8.x
- **ESLint:** 9.x
- No database or authentication layer is currently required by the application.

The repository exposes separate scripts for development, linting, type checking, and production builds.

## Local development

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

Before deployment, run:

```bash
npm run lint
npm run typecheck
npm run build
```

## Architecture / data handling

The current questionnaire is implemented in the browser. Answers are held in React state and the scoring calculation is performed locally. There is currently no Supabase integration, server-side persistence, or user account requirement visible in the application code.

This keeps the application inexpensive to operate and minimises the amount of personal information that needs to leave the user's device.

If persistence, analytics, accounts, or sharing are added in the future, the privacy and data-retention model should be reviewed before implementation.

## Security and privacy principles

- Prefer local/client-side processing whenever server persistence is not required.
- Do not collect identifying information unless a future feature explicitly requires it.
- Do not introduce analytics or third-party tracking without a clear product requirement and privacy review.
- Keep the scoring model deterministic and documented.
- Treat health-related answers as sensitive information if they are ever transmitted or persisted.

## Product positioning

The product is designed to make a long health/lifestyle questionnaire more engaging by framing it as a vehicle inspection rather than a conventional health form.

The intended experience is:

```text
AGE
  ↓
REFERENCE MILEAGE
  ↓
26 QUESTIONS
  ↓
6 CATEGORIES
  ↓
ADJUSTMENT
  ↓
HUMAN ODOMETER RESULT
```

## Project status

Current version: **0.1.0**.

The application is intentionally small and has no reason at present to require a more complex backend architecture. Any future infrastructure should be justified by an actual product requirement or measured scale need.
