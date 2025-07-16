import { FBResources, FBTexture } from "../../flatbuffers/supercell-sfw";
import { Assets, Texture } from 'pixi.js';
import { SupercellSWF } from "../SupercellSWF";

const textDecoder = new TextDecoder();

export class SWFTexture {
    /**
     * @type { SupercellSWF }
     */
    swf;
    /**
     * @type { Texture }
     */
    texture;
    /* type;
    width;
    height; */

    /**
     * 
     * @param {FBTexture} fb 
     * @param {FBResources} resources 
     */
    constructor(swf, fb) {
        this.swf = swf;

        // not used, but will keep for when it's needed
        /* this.type = fb.type();
        this.width = fb.width();
        this.height = fb.height(); */

        if (fb.dataLength()) {
            const data = new Uint8Array(fb.dataLength());
            for (let i = 0; i < fb.dataLength(); i++) {
                data[i] = fb.data(i);
            }
            this.url = "src/assets" + textDecoder.decode(data);
        } else {
            throw new Error("File is not up to date");
        }
    }

    async load() {
        this.texture = await Assets.load(this.url);
    }
}