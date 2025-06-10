import { Input as PIXIInput } from "@pixi/ui";
import { Game } from "../classes/Game";
import { Assets, Graphics, NineSliceSprite } from "pixi.js";

export class Input extends PIXIInput {
    static _sizes = {
        A: 15,
        C: 15,
        B: 15,
        D: 15
    };

    style;

    /**
     * 
     * @param {Game} game
     * @param {{
     * style?: "default";
     * width?: number;
     * height?: number;
     * }}
     */
    constructor(game, options) {
        const style = options?.style ?? "default";
        const width = options?.width ?? 240;
        const height = options?.height ?? 50;

        const font = Assets.get("Lilita One");
        let texture = game.getTexture("default_input")
        let sprite = new NineSliceSprite(texture, ...Object.values(Input._sizes))
        sprite.width = width;
        sprite.height = height;
        sprite.skew.set(-0.0874887, 0);
        super({
            bg: sprite,
            textStyle: {
                fontFamily: font.family,
                fontSize: 20,
                fill: "#000",
            },
            ...options
        })
    }

    static loadGraphic(style) {
        let inputWidth = Input._sizes.A + Input._sizes.B;
        let inputHeight = Input._sizes.C + Input._sizes.D;

        return new Graphics()
            .roundRect(-1, -1, inputWidth + 2, inputHeight + 3, 4)
            .fill("#000")
            .roundRect(0, 0, inputWidth, inputHeight, 3)
            .fill("rgba(201,205,213,255)")
            .roundRect(0, 4, inputWidth, inputHeight - 4, 3)
            .fill("#fff")
    }
}