import { useEffect, useEffectEvent } from "react";

const profiles = {
  Easy: { delay: [6500, 9000], accuracy: 0.4 },
  Medium: { delay: [4500, 7000], accuracy: 0.68 },
  Hard: { delay: [2500, 5000], accuracy: 0.88 },
};

/** Run an autonomous bot action on the host when a bot owns the active room turn. */
export default function useRoomBotTurn({ room, activePlayerId, turnDeadline, turnKey, onAction }) {
  const performAction = useEffectEvent(onAction);

  useEffect(() => {
    const hostSlot = room?.slots?.find((slot) => slot.host)?.id ?? 0;
    const bot = room?.slots?.[activePlayerId];
    if (!room || room.localSlot !== hostSlot || !bot?.isBot) return undefined;

    const profile = profiles[bot.botDifficulty] || profiles.Medium;
    const [minDelay, maxDelay] = profile.delay;
    const delay = minDelay + Math.random() * (maxDelay - minDelay);
    const timer = setTimeout(() => performAction(profile), delay);
    return () => clearTimeout(timer);
  }, [room, activePlayerId, turnDeadline, turnKey]);
}
