import { Assets, Text, TextStyle } from "pixi.js";

export class DefaultText extends Text {
    /**
     * 
     * @param {{
     *  text: string;
     *  size: number;
     *  style?: TextStyle;
     * }} param0
     */
    constructor({ text, size = 18, style = {} }) {
        const font = Assets.get("Lilita One");

        super({
            text,
            style: {
                fontFamily: font.family,
                fontSize: size,
                ...style
            }
        });

        this.resolution = 2;
    }
}