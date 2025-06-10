import { Assets, Container, Matrix } from "pixi.js";
import { ColorTransform } from "../../classes/swf_objects/ColorTransform";
import { Matrix2x3 } from "../../classes/swf_objects/Matrix2x3";
import { TextField } from "../../classes/swf_objects/TextField";
import { DefaultText } from "../DefaultText";
import { ShadowedText } from "../ShadowedText";
import { Locales } from "../../classes/Locales";

export class TextFieldComponent extends ShadowedText {
    renderized = false;

    /**
     * 
     * @param {TextField} textField 
     */
    constructor(textField) {
        super();
        this.textField = textField;
        this.objectId = textField.id;
    }

    render(colorTransform = new ColorTransform(), matrix2x3 = new Matrix2x3(), scalingGrid, name) {
        if (!this.renderized) {
            const font = Assets.get("Lilita One");

            const aligns = {
                0: [0, 0.5],
                1: [1, 0],
                2: [0.5, 0],
                16: [0, 0.5],
                17: [1, 0.5],
                18: [0.5, 0.5],
                19: [0, 0],
                32: [0, 0],
                33: [0, 0],
                34: [0, 0]
            }

            this.align = aligns[this.textField.align];

            this.__init({
                text: "",
                size: this.textField.fontSize,
                outline: this.textField.isOutlineEnabled,
                style: {
                    fontFamily: font?.family,
                    fontWeight: this.textField.isBold ? "bold" : "normal",
                    fontStyle: this.textField.isItalic ? "italic" : "normal",
                    fill: argbDecToRgbaHex(this.textField.color),
                    wordWrap: true,
                    wordWrapWidth: this.textField.bounds.width,
                    align: this.align[0] ? this.align[0] % 1 ? "center" : "right" : "left"
                },
                outlineColor: argbDecToRgbaHex(this.textField.outlineColor)
            });

            this.label = name;

            this.renderized = true;
        }

        this.applyMatrixAndColor(colorTransform, matrix2x3, scalingGrid, name);

        return this;
    }

    applyMatrixAndColor(colorTransform = new ColorTransform(), matrix2x3 = new Matrix2x3(), scalingGrid, name) {
        let content = name || "";

        if (content.startsWith("TID_")) {
            let tid = Locales.get(content);
            if (tid) {
                content = tid;
            }
        }

        this.text = content;

        const xPos = this.textField.bounds.width * this.align[0];
        const yPos = this.textField.bounds.height * this.align[1];

        matrix2x3.move(this.textField.bounds.x + xPos, this.textField.bounds.y + yPos);
        new Matrix(matrix2x3.a, matrix2x3.b, matrix2x3.c, matrix2x3.d, matrix2x3.x, matrix2x3.y).decompose(this);

        if (this.textField.autoAdjustFontSize && this.width > this.textField.bounds.width) {   
            let scaleX = this.scale.x * this.textField.bounds.width / this.width;
            let scaleY = this.scale.x * scaleX / this.scale.y;

            this.scale.set(scaleX, scaleY);
        }


        this.anchor.set(this.align[0], this.align[1]);
    }
}

function argbDecToRgbaHex(color) {
    let hex = (color >>> 0).toString(16).padStart(8, '0')
    let a = hex.slice(0, 2)
    let r = hex.slice(2, 4)
    let g = hex.slice(4, 6)
    let b = hex.slice(6, 8)

    return "#" + r + g + b + a;
}