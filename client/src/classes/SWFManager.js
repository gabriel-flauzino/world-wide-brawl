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

    async fetch(name) {
        let swf = this._swfs.get(name);
        if (!swf) {
            try {
                swf = await new SupercellSWF(this.game).load(`src/assets/scweb/${name}/${name}.scweb`);
                this._swfs.set(name, swf);
            } catch(e) {
                throw new Error("Could not load asset with name " + name);
            }
        }

        return swf;
    }

    get(name) {
        return this._swfs.get(name);
    }
}