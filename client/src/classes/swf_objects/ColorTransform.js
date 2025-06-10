import { MathHelper } from "../MathHelper";

export class ColorTransform {
    constructor(redAddition = 0, greenAddition = 0, blueAddition = 0, alpha = 255, redMultiplier = 255, greenMultiplier = 255, blueMultiplier = 255) {
        this.redAddition = redAddition;
        this.greenAddition = greenAddition;
        this.blueAddition = blueAddition;
        this.alpha = alpha;
        this.redMultiplier = redMultiplier;
        this.greenMultiplier = greenMultiplier;
        this.blueMultiplier = blueMultiplier;
    }

    static fromColorTransform(colorTransform) {
        return new ColorTransform(
            colorTransform?.redAddition,
            colorTransform?.greenAddition,
            colorTransform?.blueAddition,
            colorTransform?.alpha,
            colorTransform?.redMultiplier,
            colorTransform?.greenMultiplier,
            colorTransform?.blueMultiplier
        );
    }

    static fromFBColorTransform(fb) {
        const ct = new ColorTransform();
        ct.initFromFlatBuffer(fb);
        return ct;
    }

    initFromFlatBuffer(fb) {
        this.redAddition = fb.ra();
        this.greenAddition = fb.ga();
        this.blueAddition = fb.ba();
        this.alpha = fb.a();
        this.redMultiplier = fb.r();
        this.greenMultiplier = fb.g();
        this.blueMultiplier = fb.b();
    }

    multiply(colorTransform) {
        this.redMultiplier = MathHelper.clamp(this.redMultiplier * colorTransform.redMultiplier / 255, 0, 255);
        this.greenMultiplier = MathHelper.clamp(this.greenMultiplier * colorTransform.greenMultiplier / 255, 0, 255);
        this.blueMultiplier = MathHelper.clamp(this.blueMultiplier * colorTransform.blueMultiplier / 255, 0, 255);
        this.alpha = MathHelper.clamp(this.alpha * colorTransform.alpha / 255, 0, 255);
        this.redAddition = MathHelper.clamp(this.redAddition + colorTransform.redAddition, 0, 255);
        this.greenAddition = MathHelper.clamp(this.greenAddition + colorTransform.greenAddition, 0, 255);
        this.blueAddition = MathHelper.clamp(this.blueAddition + colorTransform.blueAddition, 0, 255);
    }

    setMulColor(red, green, blue) {
        this.redMultiplier = MathHelper.clamp(red, 0, 1) * 255;
        this.greenMultiplier = MathHelper.clamp(green, 0, 1) * 255;
        this.blueMultiplier = MathHelper.clamp(blue, 0, 1) * 255;
        return this;
    }

    setAddColor(red, green, blue) {
        this.redAddition = MathHelper.clamp(red, 0, 1) * 255;
        this.greenAddition = MathHelper.clamp(green, 0, 1) * 255;
        this.blueAddition = MathHelper.clamp(blue, 0, 1) * 255;
        return this;
    }

    setAlpha(alpha) {
        this.alpha = MathHelper.clamp(alpha, 0, 1) * 255;
        return this;
    }

    equals(other) {
        return other instanceof ColorTransform &&
            this.redMultiplier === other.redMultiplier &&
            this.greenMultiplier === other.greenMultiplier &&
            this.blueMultiplier === other.blueMultiplier &&
            this.alpha === other.alpha &&
            this.redAddition === other.redAddition &&
            this.greenAddition === other.greenAddition &&
            this.blueAddition === other.blueAddition;
    }
}