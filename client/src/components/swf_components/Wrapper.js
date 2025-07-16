import { Container } from "pixi.js";
import { Game } from "../../classes/Game";
import { Matrix2x3 } from "../../classes/swf_objects/Matrix2x3";
import { ColorTransform } from "../../classes/swf_objects/ColorTransform";

export class Wrapper extends Container {
    /**
     * @type { Game }
     */
    game;
    isRenderGroup = true;
    /**
     * A function can be assigned to apply custom properties after default rendering, such as custom scale and position.
     * @type { (b: this) => any }
     */
    apply;
    /**
     * Custom matrix
     * @type {Matrix2x3}
     */
    matrix2x3 = new Matrix2x3();
    /**
     * Custom color transform
     * @type {ColorTransform}
     */
    colorTransform = new ColorTransform();
    textMap = {};

    constructor(game) {
        super();
        this.game = game;
    }


    render(colorTransform = new ColorTransform(), matrix = new Matrix2x3(), scalingGrid, name, blend, deltaMS, textMap = {}) {
        const colorTransformMultiplied = ColorTransform.fromColorTransform(this.colorTransform);
        colorTransformMultiplied.multiply(colorTransform);
        const matrixMultiplied = Matrix2x3.fromMatrix(this.matrix2x3);
        matrixMultiplied.multiply(matrix);
        
        const spreadedTextMap = { ...textMap, ...this.textMap };

        this.children.forEach(c => {
            if (c.render && typeof c.render == "function") {
                c.render(colorTransformMultiplied, matrixMultiplied, scalingGrid, name, blend, deltaMS, spreadedTextMap);
            } 
        })

        if (this.apply && typeof this.apply == "function") {
            this.apply(this);
        }
    }

    mapText(key, value) {
        this.textMap[key] = value;
    }

    getMappedText(key) {
        return this.textMap[key];
    }
}