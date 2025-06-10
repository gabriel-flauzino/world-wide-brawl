import { FBResources, FBShapeDrawBitmapCommand } from "../../flatbuffers/supercell-sfw";
import { ShapePoint } from "./ShapePoint";

export class ShapeDrawBitmapCommand {
    /**
     * 
     * @param {FBShapeDrawBitmapCommand} fb 
     * @param {FBResources} resources 
     */
    constructor(fb, resources) {
        this.textureIndex = fb.textureIndex();
        
        this.shapePoints = new Array(fb.pointCount());
        for (let i = 0; i < fb.pointCount(); i++) {
            let sbPoint = resources.shapePoints(fb.startingPointIndex() + i);
            this.shapePoints[i] = ShapePoint.fromFBShapePoint(sbPoint);
        }
    }
}