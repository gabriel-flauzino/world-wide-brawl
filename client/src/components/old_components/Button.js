import gsap from "gsap";
import { Container, Graphics, NineSliceSprite } from "pixi.js";
import { Game } from "../classes/Game";
import { DropShadowFilter } from "pixi-filters";
import { addClickAnimation } from "../helpers/addClickAnimation";

export class Button extends Container {
    static _sizes = {
        A: 15,
        C: 15,
        B: 15,
        D: 100
    };

    game;
    /**
     * @type { NineSliceSprite }
     */
    bg;
    disabled;
    style;
    /**
     * @type { Container }
     */
    content;

    /**
     * @param { Game } game
     * @param {{
     * style?: "default" | "yellow" | "red" | "blue" | "green";
     * width?: number;
     * height?: number;
     * disabled?: boolean;  
     * }} options 
     */
    constructor(game, options) {
        super();

        this.game = game;
        this.style = options?.style ?? "default";
        const width = options?.width ?? 100;
        const height = options?.height ?? 50;
        this.disabled = options?.disabled ?? false;

        let texture = this.game.getTexture(`${this.style}_button`);
        
        this.content = new Container();
        this.bg = new NineSliceSprite(texture, ...Object.values(Button._sizes));
        this.setDisabled(this.disabled);
        this.bg.skew.set(-0.0874887, 0);
        this.bg.width = width;
        this.bg.height = height;
        this.content.addChild(this.bg);
        this.addChild(this.content);
        this.eventMode = "static";
        this.content.pivot.set(this.width / 2, this.height / 2);
        this.content.x += this.width / 2;
        this.content.y += this.height / 2;

        addClickAnimation(this, this.content);
    }

    setDisabled(disabled) {
        this.disabled = disabled;
        
        if (this.disabled) {
            this.bg.texture = this.game.getTexture(`disabled_button`);
            this.cursor = "not-allowed";
        }
        else {
            this.bg.texture = this.game.getTexture(`${this.style}_button`);
            this.cursor = "pointer";
        }
    }

    static loadGraphic(style = "default") {
        let palette = colorPalettes[style];

        let buttonWidth = Button._sizes.A + Button._sizes.B;
        let buttonHeight = Button._sizes.C + Button._sizes.D;

        return new Graphics()
            .roundRect(-1, -1, buttonWidth + 2, buttonHeight + 3, 3)
            .fill("#000")
            .roundRect(0, 0, buttonWidth, buttonHeight, 2)
            .fill(palette.primary)
            .rect(0, 0, buttonWidth, 4)
            .fill(palette.light)
            .rect(0, buttonHeight - 4, buttonWidth, 4)
            .fill(palette.dark)
            .moveTo(buttonWidth - 8, 0)
            .lineTo(buttonWidth, 0)
            .lineTo(buttonWidth, 8)
            .lineTo(buttonWidth - 8, 0)
            .fill(palette.lighter)
            .roundRect(0, 0, buttonWidth, buttonHeight, 2)
            .stroke({
                color: "#000",
                width: 1,
                alignment: 0
            })
    }

    static loadGraphicDisabled() {
        let buttonWidth = Button._sizes.A + Button._sizes.B;
        let buttonHeight = Button._sizes.C + Button._sizes.D;

        return new Graphics()
            .roundRect(-1, -1, buttonWidth + 2, buttonHeight + 3 , 3)
            .fill("rgba(69,69,69,255)")
            .roundRect(0, 0, buttonWidth, buttonHeight, 2)
            .fill("rgba(126,126,126,255)")
    }
}

const colorPalettes = {
    default: {
        primary: "rgba(53,60,82,255)",
        light: "rgba(110,95,132,255)",
        dark: "rgba(39,44,61,255)",
        lighter: "rgba(130,111,157,255)"
    },
    yellow: {
        primary: "rgba(239,198,9,255)",
        light: "rgba(251,239,68,255)",
        dark: "#a7552d",
        lighter: "rgba(254,254,163,255)"
    },
    blue: {
        primary: "rgba(35 115 254)",
        light: "rgba(19,153,250,255)",
        dark: "rgba(7,77,240,255)",
        lighter: "rgba(50,168,255,255)"
    },
    red: {
        primary: "rgba(223,54,46,255)",
        light: "rgba(242,94,91,255)",
        dark: "rgba(191,23,71,255)",
        lighter: "rgba(252,111,107,255)"
    },
    green: {
        primary: "rgba(2,219,7,255)",
        light: "rgba(0,255,0,255)",
        dark: "rgba(0,152,0,255)",
        lighter: "rgba(127,254,85,255)"
    }
}