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
     * Custom text content. Overwrites the text if it's a TID.
     */
    customValue;
    /**
     * Text alignment horizontally and vertically
     */
    align = [0, 0];
    /**
     * Whether to adjust font size to fit in one line
     */
    adjustFontSize = false;

    /**
     * 
     * @param {TextField} textField 
     */
    constructor(textField) {
        super();
        this.textField = textField;
        this.objectId = textField.id;
        this.setAdjustFontSize(textField.autoAdjustFontSize);
    }

    render(colorTransform = new ColorTransform(), matrix2x3 = new Matrix2x3(), scalingGrid, name, blend, deltaMS, textMap) {
        if (!this.renderized) {
            const font = Assets.get("Lilita One");

            const aligns = {
                0: [0, 0],
                1: [0.5, 0],
                2: [0.5, 0],
                16: [0, 0.5],
                17: [1, 0.5],
                18: [0.5, 0.5],
                19: [0, 0],
                32: [0, 0],
                33: [1, 0.5],
                34: [0, 1]
            }

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
                    wordWrapWidth: this.textField.bounds.width
                },
                outlineColor: argbDecToRgbaHex(this.textField.outlineColor || -16777216)
            });

            this.setAlign(...aligns[this.textField.align]);

            this.label = name;
            this.renderized = true;
        }

        this.applyMatrixAndColor(colorTransform, matrix2x3, name, textMap);

        return this;
    }

    applyMatrixAndColor(colorTransform = new ColorTransform(), matrix2x3 = new Matrix2x3(), name, textMap) {
        let content = (this.customValue ?? (name || "")).toString();

        if (textMap[content]) {
            content = textMap[content];
        }

        if (content.startsWith("TID_")) {
            let tid = Locales.get(content);
            if (tid) {
                content = tid;
            }
        }

        this.text = content;

        const xPos = this.textField.bounds.x + this.textField.bounds.width * this.align[0];
        const yPos = this.textField.bounds.y + this.textField.bounds.height * this.align[1];

        matrix2x3.move(xPos, yPos);
        matrix2x3.decompose(this);

        if (this.adjustFontSize && this.width > this.textField.bounds.width) {   
            let scaleX = this.scale.x * this.textField.bounds.width / this.width;
            let scaleY = this.scale.x * scaleX / this.scale.y;

            this.scale.set(scaleX, scaleY);
        }

        this.alpha = colorTransform.alpha / 255;
    }
    
    /**
     * Sets the custom content value of the text field.
     * @param {string} text The content.
     */
    setCustomValue(text) {
        this.customValue = text;
        return this;
    }

    /**
     * Whether to adjust font size to fit in one line
     * @param {boolean} bool 
     */
    setAdjustFontSize(bool) {
        this.adjustFontSize = bool;
        return this;
    }

    setAlign(hor = this.align[0], ver = this.align[1]) {
        this.align = [hor, ver];
        this.anchor.set(this.align[0], this.align[1]);
        this.textComponent.style.align = this.align[0] ? this.align[0] % 1 ? "center" : "right" : "left";
        this.textShadow.style.align = this.align[0] ? this.align[0] % 1 ? "center" : "right" : "left";
        return this;
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