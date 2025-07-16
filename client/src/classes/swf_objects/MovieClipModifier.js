import { Container } from "pixi.js";
import { FBMovieClipModifier, FBResources } from "../../flatbuffers/supercell-sfw";
import { SupercellSWF } from "../SupercellSWF";

export class MovieClipModifier {
    swf;
    id;
    tag;

    /**
     * @param {SupercellSWF} swf 
     * @param {FBMovieClipModifier} fb 
     * @param {FBResources} resources 
     */
    constructor(swf, fb) {
        this.swf = swf;
        this.id = fb.id();
        this.tag = fb.tag();
    }
}