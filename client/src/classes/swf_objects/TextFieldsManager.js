import { ByteBuffer } from "flatbuffers";
import { FBResources, FBTextFields } from "../../flatbuffers/supercell-sfw";
import { FBSCWEBLoader } from "../FBSCWEBLoader";
import { TextField } from "./TextField";

export class TextFieldsManager {
    loader;
    fb;
    resources;
    /**
     * @type {Array<TextField>}
     */
    textFields;
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
        this.fb = FBTextFields.getRootAsFBTextFields(data);
        this.resources = fbResources;
        this.textFields = new Array(this.fb.textFieldsLength());

        for (let i = 0; i < this.fb.textFieldsLength(); i++) {
            this.indexes.set(this.fb.textFields(i).id(), i);
        }
    }

    get(id) {
        let index = this.indexes.get(id);
        let object = this.textFields[index];

        if (!object) {
            object = this.textFields[index] = new TextField(this.loader.swf, this.fb.textFields(index), this.resources);
        }

        return object;
    }
}