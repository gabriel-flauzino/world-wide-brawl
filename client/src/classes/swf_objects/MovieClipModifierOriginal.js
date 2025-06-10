import { Container } from "pixi.js";
import { FBMovieClipModifier, FBResources } from "../../flatbuffers/supercell-sfw";
import { SupercellSWF } from "../SupercellSWF";

export class MovieClipModifierOriginal {
    /**
     * @type { SupercellSWF }
     */
    swf;
    id;
    tag;

    /**
     * 
     * @param {FBMovieClipModifier} fb 
     * @param {FBResources} resources 
     */
    constructor(swf, fb, resources) {
        this.swf = swf;
        this.id = fb.id();
        this.tag = fb.tag();

        this._fb = fb;
        this._resources = resources;
    }

    getId() {
        return this.id;
    }

    render() {
        let container = new Container();

        container.label = `MovieClipModifier - ${this.id}`;

        return container;
    }
}