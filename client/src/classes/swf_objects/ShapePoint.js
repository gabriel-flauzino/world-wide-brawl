import { FBShapePoint } from "../../flatbuffers/supercell-sfw";

export class ShapePoint {
    constructor(x = 0, y = 0, u = 0, v = 0) {
        this.x = x;
        this.y = y;
        this.u = u;
        this.v = v;
    }

    /**
     * 
     * @param {FBShapePoint} fbShapePoint 
     */
    static fromFBShapePoint(fbShapePoint) {
        return new ShapePoint(
            fbShapePoint.x(),
            fbShapePoint.y(),
            fbShapePoint.u(),
            fbShapePoint.v()
        );
    }

    getX() {
        return this.x;
    }

    setX(x) {
        this.x = x;
    }

    getY() {
        return this.y;
    }

    setY(y) {
        this.y = y;
    }

    getU() {
        return this.u;
    }

    setU(u) {
        this.u = u;
    }

    getV() {
        return this.v;
    }

    setV(v) {
        this.v = v;
    }

    equals(other) {
        if (this === other) return true;
        if (!(other instanceof ShapePoint)) return false;
        return (
            Math.fround(this.x) === Math.fround(other.x) &&
            Math.fround(this.y) === Math.fround(other.y) &&
            this.u === other.u &&
            this.v === other.v
        );
    }

    toString() {
        return `ShapePoint[x=${this.x}, y=${this.y}, u=${this.u}, v=${this.v}]`;
    }    
}