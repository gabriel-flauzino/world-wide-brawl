import { Container, TextStyle } from "pixi.js";
import { DefaultText } from "./DefaultText";

export class ShadowedText extends Container {
    /**
     * @type {DefaultText}
     */
    textComponent;
    /**
     * @type {DefaultText}
     */
    textShadow;
    anchor;

    /**
     * 
     * @param {{
    *  text: string;
    *  size: number;
    *  style?: TextStyle;
    *  outlineColor?: string;
    * }} options
    */
    constructor(options) {
        super();
        if (options) {
            this.__init(options);
        }
    }

    __init({ text, size = 18, outline = true, style = {}, outlineColor = "#000" }) {
        this.textComponent = new DefaultText({
            text,
            style: {
                fontSize: size,
                fill: "white",
                stroke: {
                    color: outlineColor,
                    width: size / 10
                },
                ...style
                
            },
        });
        this.textShadow = new DefaultText({
            text,
            style: {
                fontSize: size,
                stroke: {
                    color: outlineColor,
                    width: size / 10
                },
                ...style,
                fill: outlineColor  
            },
        });
        this.textShadow.y = size * 0.08;
        if (!outline) {
            this.textShadow.visible = false;
        }
        const container = this;
        this.anchor = {
            set(...p) {
                container.textComponent.anchor.set(...p);
                container.textShadow.anchor.set(...p);
            }
        }
        this.addChild(this.textShadow, this.textComponent);

        return this;
    }

    set text(value) {
        this.textShadow.text = value;
        this.textComponent.text = value;
    }

    get text() {
        return this.textComponent.text;
    }
}