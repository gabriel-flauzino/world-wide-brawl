import { parseKTXHeader } from "dds-ktx-parser";
import { FBResources, FBTexture } from "../../flatbuffers/supercell-sfw";
import { Assets, GlTexture, resourceToTexture } from 'pixi.js';
import { Game } from "../Game";
import { SupercellSWF } from "../SupercellSWF";

const textDecoder = new TextDecoder();

export class SWFTexture {
    /**
     * @type { SupercellSWF }
     */
    swf;
    type;
    width;
    height;

    /**
     * 
     * @param {FBTexture} fb 
     * @param {FBResources} resources 
     */
    constructor(swf, fb) {
        this.swf = swf;

        this.type = fb.type();
        this.width = fb.width();
        this.height = fb.height();

        if (fb.dataLength()) {
            const data = new Uint8Array(fb.dataLength());
            for (let i = 0; i < fb.dataLength(); i++) {
                data[i] = fb.data(i);
            }
            this.url = "src/assets/" + textDecoder.decode(data);
        } else {
            throw new Error("File is not up to date");
        }
    }

    async load(index) {
        await Assets.load({ alias: `${this.swf.filename}_${index}_texture`, src: this.url });
    }
}