import { Application, Assets, ViewSystem } from "pixi.js";
import { Client } from "./Client";
import lilitaOne from "../assets/fonts/lilitaone-regular-webfont.ttf";
import { initDevtools } from '@pixi/devtools';
import { Locales } from "./Locales";
import { SWFManager } from "./SWFManager";
import { LoadingScreen } from "../components/LoadingScreen";
import { LobbyScreen } from "../components/LobbyScreen";

// window.PIXI = PIXI;

export class Game extends Application {
    client = new Client();
    originalWidth = 915;
    originalHeight = 412;
    /**
     * @type { SWFManager }
     */
    swfs;

    constructor() {
        super();
        this.swfs = new SWFManager(this);

        globalThis.__PIXI_APP__ = this; // DEBUG
        initDevtools({ app: this }); // DEBUG
        window.game = this; // DEBUG
    }

    async start() {
        await this.preload();

        /* let ui = await this.swfs.fetch("ui");
        let ocev = ui.renderByName("overcharge_event");

        ocev.x = ocev.y = 200;
        this.stage.addChild(ocev);
        return; */
        const loadingScreen = this.showLoading();
        await loadingScreen.playIntro(); // waits till intro is finished
        loadingScreen.showScreen();
        await new Promise(res => setTimeout(res, 1000));
        await this.loadAssets((percentage) => loadingScreen.setProgress(percentage)); // loads all assets 
        loadingScreen.setText(Locales.get("TID_CONNECTING_TO_SERVER"));
        try {
            await this.client.start();
            this.showLobby();
            loadingScreen.removeScreen();
        } catch (e) {
            console.error(e);
            alert(Locales.get("TID_ERROR_POP_UP_CONNECTION_FAILED"));
        }
    }

    /**
     * Preloads the application and initial required assets.
     */
    async preload() {
        await this.init({
            background: "#000",
            resizeTo: window,
            resolution: devicePixelRatio,
            autoDensity: true,
            antialias: true
        });
        this.stage.eventMode = "static";

        document.body.append(this.canvas);

        // movieclip tickers
        this.ticker.add(({deltaMS}) => {
            this.stage.children.forEach(c => {
                if (c.render && typeof c.render == "function") {
                    c.render(undefined, undefined, undefined, undefined, undefined, deltaMS);
                }
            })
        });

        this.ticker.minFPS = 0;
        this.ticker.maxFPS = 60;

        await Assets.load({ alias: "Lilita One", src: lilitaOne });
        await Locales.load();
        await this.swfs.fetch("loading");
    }

    /**
     * Loads all assets.
     * @param {(perc: number) => any} onProgress 
     */
    async loadAssets(onProgress) {
        const swfs = ["ui", "background_darkgreek"];
        const phases = swfs.length * 4;
        let percentage = 0;
        let progress = () => {
            percentage += 100 / phases;
            if (onProgress && typeof onProgress == "function") {
                onProgress(percentage);
            }
        };

        for (let swf of swfs) {
            await this.swfs.fetch(swf, progress);
        }
    }

    /**
     * Shows the loading screen
     */
    showLoading() {
        return new LoadingScreen(this);
    }

    showLobby() {
        return new LobbyScreen(this);
    }
}