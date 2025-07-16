import GSAP from "gsap";
import { Game } from "../classes/Game";
import { MathHelper } from "../classes/MathHelper";
import { SupercellSWF } from "../classes/SupercellSWF";
import { MovieClipComponent } from "./swf_components/MovieClip";
import { Wrapper } from "./swf_components/Wrapper";

export class LoadingScreen extends Wrapper {
    swf;
    /**
     * Supercell game intro
     * @type { MovieClipComponent }
     */
    intro;
    /**
     * The loading screen movie clip.
     * @type { MovieClipComponent }
     */
    screen;
    /**
     * The progress bar movie clip.
     * @type { MovieClipComponent }
     */
    progressBar;
    /**
     * The progress bar text.
     * @type {string}
     */
    text;

    /**
     * 
     * @param {Game} game 
     */
    constructor(game) {
        super(game);
        this.swf = game.swfs.get("loading");

        if (this.swf) {
            this.apply = (b) => {
                b.x = window.innerWidth / 2;
                b.y = window.innerHeight / 2;
            }

            this.zIndex = 99999;

            game.stage.addChild(this);
        } else {
            throw new Error("There was an error while trying to show loading screen");
        }
    }

    /**
     * Sets the progress bar state and text content.
     * @param {number} percentage The percentage of loading progress
     */
    setProgress(percentage) {
        if (!this.screen) {
            throw new Error("Loading screen have not been created");
        }

        this.progressBar.setCurrentFrame(MathHelper.clamp(Math.round(percentage), 0, 99));
        this.setText(`${MathHelper.clamp(Math.round(percentage), 0, 100)}%`);
    }

    /**
     * Changes the text content.
     * @param {string} content 
     */
    setText(content) {
        if (!this.screen) {
            throw new Error("Loading screen have not been created");
        }

        this.text.setCustomValue(content);
    }

    /**
     * Plays the intro and returns a promise that resolves when the intro is finished.
     * @returns {Promise<void>}
     */
    playIntro() {
        if (this.intro) {
            throw new Error("Intro already playing");
        }

        this.intro = this.swf.renderByName("sc_intro");
        this.addChild(this.intro);

        return new Promise(res => setTimeout(() => {
            this.intro.removeFromParent();
            this.intro = null;
            res();
        }, this.intro.duration));
    }

    /**
     * Shows the loading screen.
     */
    showScreen() {
        if (this.screen) {
            throw new Error("Screen already shown");
        }

        this.screen = this.swf.renderByName("loading_screen");

        GSAP.fromTo(this.colorTransform, {
            alpha: 0,
        }, {
            alpha: 255,
            duration: 1
        })

        this.screen.apply = (b) => {
            let originalWidth = (b.width / b.scale.x);
            let originalHeight = (b.height / b.scale.y);
            b.scale.set(Math.min(window.innerWidth / originalWidth, window.innerHeight / (originalHeight - 200)));
        }

        this.screen.getChildByName("supercell_id").visible = false;
        this.screen.getChildByName("buttons_tencent").visible = false;
        this.screen.getChildByName("buttons_yoozoo").visible = false;
        this.screen.getChildByName("logo_KR").visible = false;
        this.screen.getChildByName("logo_JP").visible = false;
        this.screen.getChildByName("logo_CNT").visible = false;
        this.screen.getChildByName("logo_CNS").visible = false;
        this.screen.getChildByName("icon_prc_age").visible = false;
        this.screen.getChildByName("spinner").visible = false;

        this.progressBar = this.screen.getChildByName("progress_bar");
        this.text = this.screen.getChildByName("text");

        this.progressBar.setState("STOPPED");
        this.setProgress(0);

        this.screen.zIndex = 99999;

        this.addChild(this.screen);
    }

    /**
     * Removes the loading screen.
     */
    removeScreen() {
        if (this.screen) {
            GSAP.fromTo(this.colorTransform, {
                alpha: 255,
            }, {
                alpha: 0,
                duration: 1,
                ease: "linear",
                onComplete: (() => {
                    this.screen.removeFromParent();
                    this.screen = null;
                    this.progressBar = null;
                    this.text = null;
                }).bind(this)
            })
        } else {
            throw new Error("No screen to remove");
        }
    }
}