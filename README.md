# PitchIQ

PitchIQ is a React single-page football knowledge game. It includes three playable modes, a deterministic daily set, local score/streak persistence, achievements, synthesized sound effects, and a responsive layout. All puzzle data ships with the app; no API keys or backend are required.

## Setup

From an empty folder, run:

```powershell
npx create-vite@latest . --no-interactive --template react
npm install
npm install lucide-react canvas-confetti
npm install -D tailwindcss@3.4.17 postcss autoprefixer
```

Use the PitchIQ source and configuration files in this repository after scaffolding, then run:

```powershell
npm run dev
```

Create a production build with `npm run build`, and preview it locally with `npm run preview`.

## Project Structure

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
    ├── components
    │   ├── LineupGame.jsx
    │   ├── Navbar.jsx
    │   ├── PitchCanvas.jsx
    │   ├── StatsModal.jsx
    │   ├── TacticsGame.jsx
    │   └── TransferGame.jsx
    ├── context
    │   ├── contextValue.js
    │   ├── GameContext.jsx
    │   └── useGame.js
    ├── data
    │   ├── daily.js
    │   ├── gameData.js
    │   ├── matchData.js
    │   ├── tacticsData.js
    │   └── transferData.js
    └── hooks
        └── useSound.js
```

## Modes

- **Starting XI:** reveal players from a positioned 11-player formation using the search box; use the field or mobile list to target a position. Guesses, hints, and remaining time affect points.
- **Career path:** identify a player from an ordered club timeline in a 30-second round. Optional scouting clues reduce the score.
- **Tactical ID:** match tactical principles to one of four managers and read the explanation after choosing.
- **Daily three:** the same lineup, career, and tactics puzzle IDs are selected for every user on a given UTC date. The daily set and progress are stored in localStorage.

Scores, rounds, sound preference, daily progress, and streaks are stored locally under `pitchiq:stats:v1`. The daily puzzle indices use `pitchiq:daily-set:<date>`. Clearing browser storage resets local progress. There is no account sync or multiplayer service.

## Data Notes

`src/data/gameData.js` composes three starting lineups, five career paths, and five tactical profiles. The lineups include Barcelona’s 2015 UEFA Champions League final XI, Spain’s 2010 FIFA World Cup final XI, and Real Madrid’s 2018 UEFA Champions League final XI. Daily IDs are deterministic for a given release and date, so changing dataset ordering in a future release can change that release’s daily selection.
