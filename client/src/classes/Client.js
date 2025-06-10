import { Client as ColyseusClient, Room } from 'colyseus.js';

export class Client extends ColyseusClient {
    /**
     * @type { Room }
     */
    lobby;

    constructor() {
        super("https://2567-idx-world-wide-brawl-1741788168687.cluster-4xpux6pqdzhrktbhjf2cumyqtg.cloudworkstations.dev/");
    }

    async start() {
        this.lobby = await this.joinOrCreate('lobby');
    }
}