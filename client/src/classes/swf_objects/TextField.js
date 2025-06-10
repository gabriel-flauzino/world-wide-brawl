import { Assets, Container, Rectangle, Text } from "pixi.js";
import { FBResources, FBTextField } from "../../flatbuffers/supercell-sfw";
import { ShadowedText } from "../../components/ShadowedText";
import { DefaultText } from "../../components/DefaultText";
import { ColorTransform } from "./ColorTransform";
import { Matrix2x3 } from "./Matrix2x3";
import { LayoutText } from "@pixi/layout/components";

export class TextField {
    fontName = null;
    bounds = null;

    color = 0;
    outlineColor = 0;

    defaultText = null;
    anotherText = null;

    useDeviceFont = false;
    isOutlineEnabled = false;
    isBold = false;
    isItalic = false;
    isMultiline = false;
    unkBoolean = false;
    autoAdjustFontSize = false;

    align = 0;
    fontSize = 0;

    unk32 = 0;
    bendAngle = 0;

    /**
     * 
     * @param {FBTextField} fb 
     * @param {FBResources} resources 
     */
    constructor(swf, fb, resources) {
        this.swf = swf;

        this.id = fb.id();
        this.fontName = fb.fontNameRefId() !== 0 ? resources.strings(fb.fontNameRefId()) : null;
        this.bounds = new Rectangle(fb.left(), fb.top(), Math.abs(fb.left() - fb.right()), Math.abs(fb.top() - fb.bottom()));
        this.color = fb.color();
        this.outlineColor = fb.outlineColor();
        this.defaultText = fb.defaultTextRefId() !== 0 ? resources.strings(fb.defaultTextRefId()) : null;
        this.anotherText = fb.anotherTextRefId() !== 0 ? resources.strings(fb.anotherTextRefId()) : null;
        this.align = fb.align();
        this.fontSize = fb.fontSize();
        this.setStyles(fb.styles());
    }

    setStyles(styles) {
        this.useDeviceFont = (styles & 0x1) !== 0;
        this.isOutlineEnabled = (styles & 0x2) !== 0;
        this.isBold = (styles & 0x4) !== 0;
        this.isItalic = (styles & 0x8) !== 0;
        this.isMultiline = (styles & 0x10) !== 0;
        this.unkBoolean = (styles & 0x20) !== 0;
        this.autoAdjustFontSize = (styles & 0x40) !== 0;
    }

    getBendAngle() {
        return this.bendAngle / 32767 * 360;
    }

    setBendAngle(angle) {
        this.bendAngle = angle * 32767 / 360;
    }

    getId() {
        return this.id;
    }
}