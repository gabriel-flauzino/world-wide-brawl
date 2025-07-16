import { ByteBuffer } from "flatbuffers";
import { FBExports, FBResources } from "../../flatbuffers/supercell-sfw";
import { Export } from "./Export";
import { FBSCWEBLoader } from "../FBSCWEBLoader";

export class ExportsManager {
    loader;
    fb;
    resources;
    /**
     * @type { Array<Export> }
     */
    exports;
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
        this.fb = FBExports.getRootAsFBExports(data);
        this.resources = fbResources;
        this.exports = new Array(this.fb.exportIdsLength());

        for (let i = 0; i < this.fb.exportIdsLength(); i++) {
            this.indexes.set(this.fb.exportIds(i), i);
        }
    }

    /**
     * 
     * @param {number} id 
     * @returns {Export?}
     */
    get(id) {
        let index = this.indexes.get(id);
        let object = this.exports[index];

        if (!object) {
            let id = this.fb.exportIds(index);
            let exportNameId = this.fb.exportNameIds(index);

            object = this.exports[index] = new Export(this.loader.swf, id, this.resources.strings(exportNameId));
        }

        return object;
    }

    /**
     * 
     * @param {string} name 
     * @returns {Export?}
     */
    getByName(name) {
        for (let i = 0;i < this.fb.exportNameIdsLength();i++) {
            if (this.resources.strings(this.fb.exportNameIds(i)) == name) {
                return this.get(this.fb.exportIds(i));
            }
        }
    }
}