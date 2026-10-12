# PitchIQ Football Arcade

PitchIQ is a football trivia and mini-game suite for fans. Play iconic lineup, transfer-career, and tactical puzzles; test player knowledge in Market Value Guessr, Football Matrix, Who Am I?, VAR Blitz, and Duo Link; or set up a room for 1v1 and 2v2 pass-and-play.

## Run locally

```powershell
npm install
npm run dev
```

Validate production output with `npm run lint` and `npm run build`; preview with `npm run preview`.

## Feedback email delivery

The feedback form uses the Vercel `/api/feedback` function and Resend. Add `RESEND_API_KEY` to the Vercel project's environment variables to enable delivery. With Resend's default sender, the recipient must be verified in Resend; configure a verified sender domain before using a different `from` address. The recipient address is configured in the server function and is not sent to the browser.

## Game modes

- **Guess the Lineup:** guess an iconic XI using formation, shirt numbers, flags, fuzzy player search, and hints.
- **Transfer Chain:** identify a player from a chronological club career path.
- **Tactical Breakdown:** identify a manager from tactical principles and read the explanation.
- **Football Invasion:** three-tier player trivia from the five major European leagues.
- **Market Value Guessr:** higher/lower player valuation streak game.
- **Tic-Tac-Toe Grid:** name a player matching both row and column criteria to claim a tile.
- **Who Am I?:** reveal player clues progressively and guess early for more points.
- **The VAR Call:** true/false rules blitz with a 60-second countdown.
- **Duo Link:** connect football stars through a shared former club.

## Multiplayer and persistence

Room creation supports 1v1 and 2v2, player slots, mode, pool, timer settings, and room codes. This build uses BroadcastChannel and localStorage for same-browser tab lobby sync and pass-and-play. It does not provide cross-device realtime matchmaking; that requires a hosted WebSocket or PeerJS signaling service. Scores and preferences are saved locally in browser storage.

## Structure

- `src/App.jsx` is the application entry and re-exports the game hub from `src/FootballApp.jsx`.
- `src/components/` contains dedicated lobby, football mode, navigation, and stats components.
- `src/data/gameData.js` contains lineups, careers, and tactical profiles.
- `src/data/arcadeData.js` contains Market Value, Matrix, Who Am I, VAR, and Duo Link records.
- `src/data/invasionData.js` contains the three-tier Top Five Leagues player trivia pool.
