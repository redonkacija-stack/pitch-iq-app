# Pitch IQ

Pitch IQ helps startup founders and sales teams shape a clear pitch, evaluate its core story, and rehearse delivery before a high-stakes conversation. The app includes a guided builder, a transparent five-part rubric, actionable feedback, and a timed practice room. Drafts and practice metrics are stored locally in the browser; the current rubric is a deterministic writing checklist, not an AI model or a prediction of fundraising or sales outcomes.

## Run locally

```powershell
npm install
npm run dev
```

Create and preview a production build with:

```powershell
npm run build
npm run preview
```

## Workflows

- **Overview:** see the active pitch draft, completeness, latest score, best score, and locally recorded practice sessions.
- **Pitch builder:** work through audience/problem, solution, evidence, ask, and review steps. The live rubric preview updates as the draft changes.
- **Scorecard:** inspect clarity, problem, solution, proof, and ask scores with a reason and suggested next edit for each.
- **Practice room:** rehearse against a 60-second timer, rate confidence, and record the session to update local metrics.

## Persistence and scoring

The draft and practice metrics are saved under `pitchiq-coach-workspace:v1` in localStorage. Clearing browser storage resets them. Scoring runs locally from text completeness, specificity signals, and measurable evidence; nothing is sent to an API. There is no account sync or cloud storage.

## Structure

```text
.
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
└── src
    ├── App.jsx
    ├── index.css
    ├── main.jsx
    └── components/    # Earlier football-mode components are not used by the pitch workspace
```
