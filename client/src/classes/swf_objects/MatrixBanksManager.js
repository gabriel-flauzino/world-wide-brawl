import { FBSCWEBLoader } from "../FBSCWEBLoader";
import { FBResources } from "../../flatbuffers/supercell-sfw";
import { ScMatrixBank } from "./ScMatrixBank";

export class MatrixBanksManager {
    loader;
    resources;
    /**
     * @type { Array<ScMatrixBank> }
     */
    matrixBanks;

    /**
     * @param {FBSCWEBLoader} loader 
     * @param {FBResources} resources
     */
    constructor(loader, resources) {
        this.loader = loader;
        this.resources = resources;
        this.matrixBanks = new Array(resources.matrixBanksLength());

        for (let i = 0; i < resources.matrixBanksLength(); i++) {
            let fbMatrixBank = resources.matrixBanks(i);
            let matrixBank = ScMatrixBank.fromFBMatrixBank(fbMatrixBank, true);

            let matrixCount;
            if (matrixBank.isShort) {
                matrixCount = fbMatrixBank.shortMatricesLength();
            } else {
                matrixCount = fbMatrixBank.matricesLength();
            }

            if (matrixBank.isShort) {
                for (let j = 0; j < matrixCount; j++) {
                    let fbMatrix = fbMatrixBank.shortMatrices(j);
                    matrixBank.getMatrix(j).initFromFlatBuffer(fbMatrix);
                }
            } else {
                for (let j = 0; j < matrixCount; j++) {
                    let fbMatrix = fbMatrixBank.matrices(j);
                    matrixBank.getMatrix(j).initFromFlatBuffer(fbMatrix);
                }
            }

            for (let j = 0; j < fbMatrixBank.colorTransformsLength(); j++) {
                let fbColorTransform = fbMatrixBank.colorTransforms(j);
                matrixBank.getColorTransform(j).initFromFlatBuffer(fbColorTransform);
            }

            this.matrixBanks[i] = matrixBank;
        }
    }


    getColorTransform(matrixBankIndex, colorTransformIndex) {
        let matrixBank = this.getMatrixBank(matrixBankIndex);
        let object = matrixBank.getColorTransform(colorTransformIndex);

        return object;
    }

    getMatrix(matrixBankIndex, matrixIndex) {
        let matrixBank = this.getMatrixBank(matrixBankIndex);
        let object = matrixBank.getMatrix(matrixIndex);

        return object;
    }

    getMatrixBank(matrixBankIndex) {
        let object = this.matrixBanks[matrixBankIndex];

        return object;
    }
}