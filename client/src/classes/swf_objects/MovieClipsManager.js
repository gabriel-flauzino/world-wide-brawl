import { ByteBuffer } from "flatbuffers";
import { FBMovieClips, FBResources } from "../../flatbuffers/supercell-sfw";
import { FBSCWEBLoader } from "../FBSCWEBLoader";
import { MovieClip } from "./MovieClip";

export class MovieClipsManager {
    loader;
    fb;
    resources;
    /**
     * @type {Array<MovieClip>}
     */
    movieClips;
    /**
     * @type { Map<number, number> }
     */
    indexes = new Map();

    /**
     * @param {FBSCWEBLoader} loader 
     * @param {ByteBuffer} data
     * @param {FBResources} fbResources 
     */
    constructor(loader, data, fbResources) {
        this.loader = loader;
        this.fb = FBMovieClips.getRootAsFBMovieClips(data);
        this.resources = fbResources;

        this.movieClips = new Array(this.fb.clipsLength());

        for (let i = 0; i < this.fb.clipsLength(); i++) {
            this.indexes.set(this.fb.clips(i).id(), i);
        }
    }

    get(id) {
        let index = this.indexes.get(id);
        let object = this.movieClips[index];

        if (!object) {
            object = this.movieClips[index] = new MovieClip(this.loader.swf, this.fb.clips(index), this.resources);
        }

        return object;
    }
}