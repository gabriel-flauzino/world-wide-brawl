import ByteBuffer from "bytebuffer";
import { ByteBuffer as FBByteBuffer } from "flatbuffers";
import { FBExports, FBMovieClipModifiers, FBMovieClips, FBResources, FBShapes, FBTextFields, FBTextureSets } from "../flatbuffers/supercell-sfw";
import { Export } from "./swf_objects/Export";
import { MovieClipModifierOriginal } from "./swf_objects/MovieClipModifierOriginal";
import { MovieClip } from "./swf_objects/MovieClip";
import { ScMatrixBank } from "./swf_objects/ScMatrixBank";
import { Shape } from "./swf_objects/Shape";
import { SWFTexture } from "./swf_objects/SWFTexture";
import { TextField } from "./swf_objects/TextField";
import { SupercellSWF } from "./SupercellSWF";

export class FlatSupercellSWFLoader {
    /**
     * @type { SupercellSWF }
     */
    swf;
    fbResources;
    matrixBanks;
    exports;
    textFields;
    shapes;
    movieClips;
    modifiers;
    textures;

    constructor(swf, data, preferLowres) {
        this.swf = swf;

        let byteBuffer = ByteBuffer.wrap(data);
        byteBuffer.order(ByteBuffer.LITTLE_ENDIAN);
        
        let s1 = Date.now();
        console.log("deserializing resources");
        this.fbResources = FBResources.getRootAsFBResources(this.getChunkBytes(byteBuffer).data);
        console.log("resources took " + (Date.now() - s1) + " ms");
        let s2 = Date.now();
        console.log("deserializing matrixbanks");
        this.matrixBanks = this.deserializeMatrixBanks();
        console.log("matrixbanks took " + (Date.now() - s2) + " ms");
        let s3 = Date.now();
        console.log("deserializing exports");
        this.exports = this.deserializeExports(this.getChunkBytes(byteBuffer).data);
        console.log("exports took " + (Date.now() - s3) + " ms");
        let s4 = Date.now();
        console.log("deserializing text fields");
        this.textFields = this.deserializeTextFields(this.getChunkBytes(byteBuffer).data);
        console.log("resources took " + (Date.now() - s4) + " ms");
        let s5 = Date.now();
        console.log("deserializing shapes");
        this.shapes = this.deserializeShapes(this.getChunkBytes(byteBuffer).data);
        console.log("shapes took " + (Date.now() - s5) + " ms");
        let s6 = Date.now();
        console.log("deserializing movie clips");
        this.movieClips = this.deserializeMovieClips(this.getChunkBytes(byteBuffer).data);
        console.log("movie clips took " + (Date.now() - s6) + " ms");
        let s7 = Date.now();
        console.log("deserializing mods");
        this.modifiers = this.deserializeModifiers(this.getChunkBytes(byteBuffer).data);
        console.log("mods took " + (Date.now() - s7) + " ms");
        let s8 = Date.now();
        console.log("deserializing textures");
        this.textures = this.deserializeTextures(this.getChunkBytes(byteBuffer).data, preferLowres);
        console.log("textures took " + (Date.now() - s8) + " ms");

        byteBuffer = null;
    }

    deserializeTextures(chunkBuffer, preferLowres) {
        let fbTextureSets = FBTextureSets.getRootAsFBTextureSets(chunkBuffer);

        /**
         * @type {SWFTexture[]}
         */
        let textures = new Array(fbTextureSets.textureSetsLength());
        for (let i = 0; i < fbTextureSets.textureSetsLength(); i++) {
            let fbTextureSet = fbTextureSets.textureSets(i);
            let fbHighresTexture = fbTextureSet.highresTexture();
            let fbLowresTexture = fbTextureSet.lowresTexture();

            let fbTexture;

            if ((fbHighresTexture == null || preferLowres) && fbLowresTexture != null) {
                fbTexture = fbLowresTexture;
            } else if (fbHighresTexture != null) {
                fbTexture = fbHighresTexture;
            } else {
                throw new Error("FBTextureSet doesn't contain any textures.");
            }

            textures[i] = new SWFTexture(this.swf, fbTexture, this.fbResources);
        }

        return textures;
    }

    deserializeModifiers(chunkBuffer) {
        let fbModifiers = FBMovieClipModifiers.getRootAsFBMovieClipModifiers(chunkBuffer);
        /**
         * @type {MovieClipModifierOriginal[]}
         */
        let modifiers = new Array(fbModifiers.modifiersLength());
        for (let i = 0; i < fbModifiers.modifiersLength(); i++) {
            modifiers[i] = new MovieClipModifierOriginal(this.swf, fbModifiers.modifiers(i));
        }
        return modifiers;
    }

    deserializeMovieClips(chunkBuffer) {
        let fbMovieClips = FBMovieClips.getRootAsFBMovieClips(chunkBuffer);
        /**
         * @type {MovieClip[]}
         */
        let movieClips = new Array(fbMovieClips.clipsLength());
        for (let i = 0; i < fbMovieClips.clipsLength(); i++) {
            movieClips[i] = new MovieClip(this.swf, fbMovieClips.clips(i), this.fbResources);
        }

        return movieClips;
    }

    deserializeShapes(chunkBuffer) {
        let fbShapes = FBShapes.getRootAsFBShapes(chunkBuffer);
        /**
         * @type {Shape[]}
         */
        let shapes = new Array(fbShapes.shapesLength());
        for (let i = 0; i < fbShapes.shapesLength(); i++) {
            shapes[i] = new Shape(this.swf, fbShapes.shapes(i), this.fbResources);
        }
        return shapes;
    }

    deserializeTextFields(chunkBuffer) {
        let fbTextFields = FBTextFields.getRootAsFBTextFields(chunkBuffer);
        /**
         * @type {TextField[]}
         */
        let textFields = new Array(fbTextFields.textFieldsLength());
        for (let i = 0; i < fbTextFields.textFieldsLength(); i++) {
            textFields[i] = new TextField(this.swf, fbTextFields.textFields(i), this.fbResources);
        }
        return textFields;
    }

    deserializeExports(chunkBuffer) {
        let fbExports = FBExports.getRootAsFBExports(chunkBuffer);
        if (fbExports.exportIdsLength() != fbExports.exportNameIdsLength()) {
            throw new isError("Export ids and name ids count must be equal!");
        }
        /**
         * @type {Export[]}
         */
        let exports = new Array(fbExports.exportIdsLength());
        for (let i = 0; i < fbExports.exportIdsLength(); i++) {
            let id = fbExports.exportIds(i);
            let exportNameId = fbExports.exportNameIds(i);

            if (exportNameId == 0) {
                throw new Error("Export name not found! Movie clip id: " + id);
            }

            exports[i] = new Export(this.swf, id, this.fbResources.strings(exportNameId));
        }

        return exports;
    }

    deserializeMatrixBanks() {
        /**
         * @type {ScMatrixBank[]}
         */
        let matrixBanks = new Array(this.fbResources.matrixBanksLength());
        for (let j = 0; j < this.fbResources.matrixBanksLength(); j++) {
            let fbMatrixBank = this.fbResources.matrixBanks(j);

            let matrixCount = fbMatrixBank.matricesLength();
            if (fbMatrixBank.matricesLength() == 0) {
                matrixCount = fbMatrixBank.shortMatricesLength();
            }

            let matrixBank = new ScMatrixBank(matrixCount, fbMatrixBank.colorTransformsLength());

            if (fbMatrixBank.matricesLength() > 0) {
                for (let i = 0; i < matrixCount; i++) {
                    let fbMatrix2x3 = fbMatrixBank.matrices(i);
                    matrixBank.getMatrix(i).initFromFlatBuffer(fbMatrix2x3);
                }
            } else {
                for (let i = 0; i < fbMatrixBank.shortMatricesLength(); i++) {
                    let fbMatrix2x3 = fbMatrixBank.shortMatrices(i);
                    matrixBank.getMatrix(i).initFromFlatBuffer(fbMatrix2x3);
                }
            }

            for (let i = 0; i < fbMatrixBank.colorTransformsLength(); i++) {
                let fbColorTransform = fbMatrixBank.colorTransforms(i);
                matrixBank.getColorTransform(i).initFromFlatBuffer(fbColorTransform);
            }

            matrixBanks[j] = matrixBank;
        }

        return matrixBanks;
    }

    /**
     * 
     * @param {ByteBuffer} byteBuffer 
     */
    getChunkBytes(byteBuffer) {
        let length = byteBuffer.readInt32();
        let bytes = byteBuffer.readBytes(length).toBuffer();
        return {
            length,
            data: new FBByteBuffer(new Uint8Array(bytes))
        };
    }
}