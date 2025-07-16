import { Game } from "./Game";
import { SupercellSWF } from "./SupercellSWF";

export class SWFManager {
    /**
     * @type { Map<string, SupercellSWF> }
     */
    _swfs = new Map();

    /**
     * 
     * @param {Game} game 
     */
    constructor(game) {
        this.game = game;
    }

    /**
     * Fetches a SWF or returns the cached one.
     * @param {string} name 
     * @param {() => any} onProgress 
     * @returns 
     */
    async fetch(name, onProgress) {
        let swf = this._swfs.get(name);
        if (!swf) {
            try {
                swf = await new SupercellSWF(this.game).load(`src/assets/scweb/${name}/${name}.scweb`, onProgress);
                this._swfs.set(name, swf);
            } catch(e) {
                e.message = `[${name}] Could not load asset: ${e.message}`;
                throw e;
            }
        }

        return swf;
    }

    get(name) {
        return this._swfs.get(name);
    }
}