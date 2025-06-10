import { Room } from "colyseus";
import { LobbyRoomState } from "./schema/LobbyRoomState";
import { database } from "../database/Database";

export class LobbyRoom extends Room<LobbyRoomState> {
  maxClients = 100;
  state = new LobbyRoomState();

  onCreate() {
    this.onMessage("login", async (client, message: { token: string }) => {
      let user = await database.collections.users.getByToken(message.token);

      console.log(message.token, user);

      if (!user || user.error)
        client.send("registrationNeeded");
      else {
        client.userData = user;
        client.send("loggedIn", { user });
      }
    })

    this.onMessage("register", async (client, message: { username: string }) => {
      console.log("ele quer registrar: " + message.username)
      let user = await database.collections.users.insert({ username: message.username });
      if (user.error)
        client.send("registrationError");
      else 
        client.send("authenticated", { user });
    })
  }
}