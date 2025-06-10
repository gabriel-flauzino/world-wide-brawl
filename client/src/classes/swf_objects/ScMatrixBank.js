import * as _ from "lodash";
import { Matrix2x3 } from "./Matrix2x3";
import { ColorTransform } from "./ColorTransform";

export class ScMatrixBank {
    /**
     * @type {Array<Matrix2x3>}
     */
    matrices;
    /**
     * @type {Array<ColorTransform>}
     */
    colorTransforms;

    constructor(matrixCount = 0, colorTransformCount = 0) {
        this.init(matrixCount, colorTransformCount);
    }

    init(matrixCount, colorTransformCount) {
        this.matrices = new Array(matrixCount);
        for (let i = 0; i < matrixCount; i++) {
            this.matrices[i] = new Matrix2x3();
        }

        this.colorTransforms = new Array(colorTransformCount);
        for (let i = 0; i < colorTransformCount; i++) {
            this.colorTransforms[i] = new ColorTransform();
        }
    }

    addMatrix(matrix) {
        this.matrices.push(matrix);
    }

    addColorTransform(colorTransform) {
        this.colorTransforms.push(colorTransform);
    }

    getMatrices() {
        return this.matrices;
    }

    getColorTransforms() {
        return this.colorTransforms;
    }

    getMatrix(index) {
        return this.matrices.at(index);
    }

    getColorTransform(index) {
        return this.colorTransforms.at(index);
    }

    getMatrixCount() {
        return this.matrices.length;
    }

    getColorTransformCount() {
        return this.colorTransforms.length;
    }
}