import { ByteBuffer } from "flatbuffers";
import { FBMovieClipModifiers } from "../../flatbuffers/supercell-sfw";
import { FBSCWEBLoader } from "../FBSCWEBLoader";
import { MovieClipModifier } from "./MovieClipModifier";

export class MovieClipModifiersManager {
    loader;
    fb;
    /**
     * @type {Array<MovieClipModifier>}
     */
    modifiers;
    /**
     * @type { Map<number, number> }
     */
    indexes = new Map();

    /**
     * @param {FBSCWEBLoader} loader 
     * @param {ByteBuffer} data
     */
    constructor(loader, data) {
        this.loader = loader;
        this.fb = FBMovieClipModifiers.getRootAsFBMovieClipModifiers(data);

        this.modifiers = new Array(this.fb.modifiersLength());

        for (let i = 0; i < this.fb.modifiersLength(); i++) {
            this.indexes.set(this.fb.modifiers(i).id(), i);
        }
    }

    get(id) {
        let index = this.indexes.get(id);
        let object = this.modifiers[index];

        if (!object) {
            object = this.modifiers[index] = new MovieClipModifier(this.loader.swf, this.fb.modifiers(index));
        }

        return object;
    }
}