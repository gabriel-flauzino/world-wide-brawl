import { Application, Container, Graphics, Sprite } from "pixi.js";

export class LoadingBar extends Container {
    static _sizes = {
        A: 15,
        C: 15,
        B: 15,
        D: 100
    };

    /** 
     * @type { Sprite }
     * 
     * */
    _loadFill;

    /**
     * @param { Application } app
     */
    constructor(app, options = {}) {
        super()
        this.skew.set(-0.0874887, 0);

        let width = options.width || 220;
        let height = options.height || 24;
        let style = options.style || "default";

        const palette = colorPalettes[style];

        const blackbg = new Sprite(
            app.renderer.generateTexture(
                new Graphics()
                    .roundRect(0, 0, width + 2, height + 2, 3)
                    .fill({
                        color: "#000"
                    })
            )
        );

        const background = new Sprite(
            app.renderer.generateTexture(
                new Graphics()
                    .rect(0, 0, width, height * 0.6)
                    .fill(palette.backgroundTop)
                    .rect(0, height * 0.6, width, height * 0.4)
                    .fill(palette.backgroundBottom)
            )
        );

        this._loadFill = new Sprite(
            app.renderer.generateTexture(
                new Graphics()
                    .rect(0, 0, width + (palette.loadEnd ? 12 : 0), height * 0.5)
                    .fill(palette.loadTop)
                    .rect(0, height * 0.5, width + (palette.loadEnd ? 12 : 0), height * 0.5)
                    .fill(palette.loadBottom)
                    .rect(width + 7, 0, (palette.loadEnd ? 5 : 0), height)
                    .fill("rgb(255,255,255,255)")
                    .rect(width, 0, (palette.loadEnd ? 7 : 0), height)
                    .fill("rgb(255 255 255 / 60%)")
            )
        );

        const mask = new Graphics()
            .roundRect(0, 0, width, height, 2)
            .fill("#000");
            
        blackbg.x = -1;
        blackbg.y = -1;

        this._loadFill.setMask({ mask });
        this._loadFill.x = 0;

        this.setLoaded(0);

        this.addChild(blackbg, background, this._loadFill, mask);
    }

    setLoaded(percentage) {
        this._loadFill.x = this.width * ((percentage - 100) / 100);
    }
}

const colorPalettes = {
    default: {
        backgroundTop: "rgb(71,1,39,255)",
        backgroundBottom: "rgb(96,1,53,255)",
        loadTop: "rgb(238,117,39,255)",
        loadBottom: "rgb(218,92,67,255)",
        loadEnd: true
    },
    default_2: {
        backgroundTop: "rgba(33,39,58,255)",
        backgroundBottom: "rgba(42,49,71,255)",
        loadTop: "rgb(238,117,39,255)",
        loadBottom: "rgb(218,92,67,255)",
        loadEnd: false
    },
    brawlpass: {
        backgroundTop: "rgba(33,39,58,255)",
        backgroundBottom: "rgba(42,49,71,255)",
        loadTop: "rgba(254,231,70,255)",
        loadBottom: "rgba(240,117,39,255)",
        loadEnd: false
    },

}