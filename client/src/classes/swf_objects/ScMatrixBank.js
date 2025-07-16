import * as _ from "lodash";
import { Matrix2x3 } from "./Matrix2x3";
import { ColorTransform } from "./ColorTransform";
import { FBMatrixBank } from "../../flatbuffers/supercell-sfw";

export class ScMatrixBank {
    /**
     * @type {Array<Matrix2x3>}
     */
    matrices;
    /**
     * @type {Array<ColorTransform>}
     */
    colorTransforms;
    /**
     * @type {FBMatrixBank | undefined}
     */
    fb;
    isShort = false;

    constructor(matrixCount = 0, colorTransformCount = 0, fillArrays = true) {
        this.init(matrixCount, colorTransformCount, fillArrays);
    }

    /**
     * 
     * @param {FBMatrixBank} fbMatrixBank 
     * @returns {ScMatrixBank}
     */
    static fromFBMatrixBank(fbMatrixBank, fillArrays = false) {
        let object = new ScMatrixBank(fbMatrixBank.matricesLength() || fbMatrixBank.shortMatricesLength(), fbMatrixBank.colorTransformsLength(), fillArrays);

        if (fbMatrixBank.matricesLength() == 0) {
            object.isShort = true;
        }

        object.fb = fbMatrixBank;
        return object;
    }

    init(matrixCount, colorTransformCount, fillArrays = true) {
        this.matrices = new Array(matrixCount);
        this.colorTransforms = new Array(colorTransformCount);

        if (fillArrays) {
            for (let i = 0; i < matrixCount; i++) {
                this.matrices[i] = new Matrix2x3();
            }
            for (let i = 0; i < colorTransformCount; i++) {
                this.colorTransforms[i] = new ColorTransform();
            }
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