import { Assets, Container, Graphics, Sprite } from "pixi.js";
import { Game } from "../classes/Game";
import { LoadingBar } from "./LoadingBar";
import { ShadowedText } from "./ShadowedText";
import gsap from "gsap";

export class LoadingScreen extends Container {
    /**
     * @type { LoadingBar }
     */
    loadingBar;
    /**
     * @type { ShadowedText }
     */
    loadingText;

    /**
     * @type { Game }
     */
    game;

    /**
     * 
     * @param { Game } game 
     */
    constructor(game) {
        super();
        this.zIndex = 9999;
        this.game = game;
        const loadingMenu = new Sprite(Assets.get("loading_image"));
        this.loadingBar = new LoadingBar(game);
        this.loadingText = new ShadowedText({
            text: "1%",
            size: 30
        })
        this.addChild(loadingMenu, this.loadingBar, this.loadingText);

        game.scalesAndPositionManager.addPositionAndScale(loadingMenu, {
            align: "center",
            vertical: "center"
        }, {
            scale: "100%",
            scaleMode: "x"
        })

        game.scalesAndPositionManager.addPositionAndScale(this.loadingBar, {
            align: "center",
            vertical: "end",
            padY: 15
        }, {
            width: 70
        })
        game.scalesAndPositionManager.addPositionAndScale(this.loadingText, {
            align: "center",
            anchor: true,
            vertical: "end",
            padY: 50
        }, {
            width: 20
        })

        gsap.fromTo(this, {
            alpha: 0
        }, {
            alpha: 1
        })

    }

    setLoaded(value) {
       this.loadingBar.setLoaded(value);
    }

    setText(value) {
        this.loadingText.text = value;
    }

    remove() {
        let destroy = this.destroy.bind(this);
        
        gsap.to(this, {
            alpha: 0,
            onComplete() {
                destroy();
            }
        });
    }
}