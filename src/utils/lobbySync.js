/**
 * PitchIQ Lobby Synchronization Utility (PeerJS + Local Fallback Bridge)
 */
export {
  generateRoomCode,
  normalizeRoomCode,
  cleanCodeKey,
  readAllRooms,
  saveRoom,
  getRoom,
  getShareableRoomUrl,
  PeerSyncEngine,
} from "./peerSync";

import { PeerSyncEngine } from "./peerSync";

export class LobbySyncEngine {
  constructor(roomCode, onUpdate) {
    this.engine = new PeerSyncEngine({
      roomCode,
      isHost: true,
      onStateChange: (updatedRoom) => {
        onUpdate?.(updatedRoom);
      },
    });
  }

  broadcast(room) {
    this.engine.updateRoom(room);
  }

  destroy() {
    this.engine.destroy();
  }
}
