import { Room } from "colyseus";
import { LobbyRoomState } from "./schema/LobbyRoomState";
import { database } from "../database/Database";

export class LobbyRoom extends Room<LobbyRoomState> {
  maxClients = 10;
  state = new LobbyRoomState();

  onCreate() {
    
  }

  onJoin() {
    
  }

  onLeave() {
    
  }

  onDispose() {
      
  }
}