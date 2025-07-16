import ByteBuffer from "bytebuffer";
import { ByteBuffer as FBByteBuffer } from "flatbuffers";
import { FBResources } from "../flatbuffers/supercell-sfw";
import { SupercellSWF } from "./SupercellSWF";
import { clearBuffer } from "../helpers/clearBuffer";
import { MovieClipsManager } from "./swf_objects/MovieClipsManager";
import { ExportsManager } from "./swf_objects/ExportsManager";
import { TextFieldsManager } from "./swf_objects/TextFieldsManager";
import { ShapesManager } from "./swf_objects/ShapesManager";
import { MovieClipModifiersManager } from "./swf_objects/MovieClipModifiersManager";
import { TexturesManager } from "./swf_objects/TexturesManager";
import { MatrixBanksManager } from "./swf_objects/MatrixBanksManager";

export class FBSCWEBLoader {
    swf;
    byteBuffer;
    fbResources;
    matrixBanks;
    exports;
    textFields;
    shapes;
    movieClips;
    modifiers;
    textures;

    /**
     * Deserializes the SCWEB FlatBuffer data.
     * @param { SupercellSWF } swf
     * @param {Uint8Array} data 
     */
    constructor(swf, data) {
        this.swf = swf;

        this.byteBuffer = ByteBuffer.wrap(data);
        this.byteBuffer.order(ByteBuffer.LITTLE_ENDIAN);

        this.fbResources = FBResources.getRootAsFBResources(this.getChunkBytes());
        this.matrixBanks = new MatrixBanksManager(this, this.fbResources);
        this.exports = new ExportsManager(this, this.getChunkBytes(), this.fbResources);
        this.textFields = new TextFieldsManager(this, this.getChunkBytes(), this.fbResources);
        this.shapes = new ShapesManager(this, this.getChunkBytes(), this.fbResources);
        this.movieClips = new MovieClipsManager(this, this.getChunkBytes(), this.fbResources);
        this.modifiers = new MovieClipModifiersManager(this, this.getChunkBytes());
        this.textures = new TexturesManager(this, this.getChunkBytes());

        clearBuffer(this.byteBuffer.buffer);
    }

    /**
     * Reads a chunk of serialized data
     * @returns {FBByteBuffer}
     */
    getChunkBytes() {
        let length = this.byteBuffer.readInt32();
        let bytes = this.byteBuffer.readBytes(length).toBuffer();
        return new FBByteBuffer(new Uint8Array(bytes));
    }
}