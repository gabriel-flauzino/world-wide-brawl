import { ByteBuffer } from "flatbuffers";
import { FBResources, FBShapes } from "../../flatbuffers/supercell-sfw";
import { FBSCWEBLoader } from "../FBSCWEBLoader";
import { Shape } from "./Shape";

export class ShapesManager {
    loader;
    fb;
    resources;
    /**
     * @type {Array<Shape>}
     */
    shapes;
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
        this.fb = FBShapes.getRootAsFBShapes(data);
        this.resources = fbResources;

        this.shapes = new Array(this.fb.shapesLength());

        for (let i = 0; i < this.fb.shapesLength(); i++) {
            this.indexes.set(this.fb.shapes(i).id(), i);
        }
    }

    get(id) {
        let index = this.indexes.get(id);
        let object = this.shapes[index];

        if (!object) {
            object = this.shapes[index] = new Shape(this.loader.swf, this.fb.shapes(index), this.resources);
        }

        return object;
    }
}