import { ByteBuffer } from "flatbuffers";
import { FBTextureSets } from "../../flatbuffers/supercell-sfw";
import { FBSCWEBLoader } from "../FBSCWEBLoader";
import { SWFTexture } from "./SWFTexture";

export class TexturesManager {
    loader;
    fb;
    /**
     * @type {Array<SWFTexture>}
     */
    textures;

    /**
     * @param {FBSCWEBLoader} loader 
     * @param {ByteBuffer} data
     */
    constructor(loader, data) {
        this.loader = loader;
        let fb = FBTextureSets.getRootAsFBTextureSets(data);

        this.textures = new Array(fb.textureSetsLength());

        for (let i = 0; i < fb.textureSetsLength(); i++) {
            let textureSet = fb.textureSets(i);
            let highres = textureSet.highresTexture();
            let lowres = textureSet.lowresTexture();

            let texture = highres || lowres;

            this.textures[i] = new SWFTexture(this.loader.swf, texture);
        }
    }

    get(index) {
        return this.textures[index];
    }

    async loadAll() {
        for (let texture of this.textures) {
            await texture.load();
        }
    }
}