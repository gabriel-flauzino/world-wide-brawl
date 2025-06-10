import { Application, Assets, extensions } from "pixi.js";
import * as Zstd from "@bokuweb/zstd-wasm"
import { Client } from "./Client";
// import { Button } from "../components/Button";
// import { LoadingBar } from "../components/LoadingBar";
// import loadingImage from "../assets/images/loading_screens/loading_2025_lumi.png";
import lilitaOne from "../assets/fonts/lilitaone-regular-webfont.ttf";
// import { LoadingScreen } from "../components/LoadingScreen";
// import { LoginScreen } from "../components/LoginScreen";
// import { Input } from "../components/Input";
// import { ScalesAndPositionManager } from "./ScalesAndPositionManager";
// import { LobbyScreen } from "../components/LobbyScreen";
import { SupercellSWF } from "./SupercellSWF";
import { initDevtools } from '@pixi/devtools';
import { Locales } from "./Locales";

// window.PIXI = PIXI;

export class Game extends Application {
    /**
     * @type { Client }
     */
    client;
    _textures = {};
    userData;
    originalWidth = 915;
    originalHeight = 412;
    /**
     * @type { ScalesAndPositionManager }
     */
    scalesAndPositionManager;

    constructor(client) {
        super();

        this.client = client;

        window.game = this; // debug
        globalThis.__PIXI_APP__ = this;

        initDevtools({ app: this });
    }

    async start() {
        await this.init({
            background: "#ccc", 
            resizeTo: window,
            resolution: devicePixelRatio, 
            autoDensity: true,
            antialias: true
        });
        
        this.renderer.resize(window.innerWidth, window.innerHeight)
        
        this.stage.eventMode = "static";
        document.body.append(this.canvas);
        if (localStorage.getItem("LOAD_SC_TEST") == "true") {
            await Zstd.init();
            this.loadScTest();
            return;
        }
        let loading = await this.showLoading();
        await this.loadTextures(loading);
        loading.setText("Conectando ao servidor...")
        this.client.joinOrCreate("lobby")
            .then(lobby => {
                loading.setText("100%");
                const token = localStorage.getItem("auth_token");

                lobby.onMessage("loggedIn", (message) => {
                    this.userData = message.user;
                    const lobbyScreen = new LobbyScreen(this, lobby);
                    this.stage.addChild(lobbyScreen);
                    loading.remove();
                })
                lobby.onMessage("registrationNeeded", () => {
                    const loginScreen = new LoginScreen(this, lobby);
                    this.stage.addChild(loginScreen);
                    loading.remove();
                })
                lobby.send("login", { token });
            })
            .catch(() => {
                console.log("Não foi possível conectar ao servidor.")
            })
    }

    async loadScTest() {
        console.log("Starting sc load test");

        await Assets.load({ alias: "Lilita One", src: lilitaOne });
        await Locales.load();

        this.ticker.add(() => {
            this.stage.children.forEach(c => {
                if (c.render && typeof c.render == "function") {
                    c.render();
                }
            })
        });
        
        let loading = await new SupercellSWF(this).load("src/assets/scweb/loading/loading.scweb");

        let loadingScr = loading.renderByName("loading_screen");

        loadingScr.apply = (b) => {
            b.x = window.innerWidth / 2;
            b.y = window.innerHeight / 2;
        } 

        this.stage.addChild(loadingScr);

        await new Promise(r => setTimeout(r, 8000));

        let ui = await new SupercellSWF(this).load("src/assets/scweb/ui/ui.scweb"); // debug
        let bg = await new SupercellSWF(this).load("src/assets/scweb/background_feudaljapan/background_feudaljapan.scweb");

        console.log("mainTr");

        const bgr = bg.renderByName("bgr_feudaljapan");
        const mainTL = ui.renderByName("mainscreen_hud_top_left");
        const mainTR = ui.renderByName("mainscreen_hud_top_right");
        const mainBL = ui.renderByName("mainscreen_hud_bottom_left");
        const mainBR = ui.renderByName("mainscreen_hud_bottom_right");

        bgr.apply = (b) => {
            b.x = window.innerWidth / 2;
            b.y = window.innerHeight / 2;
        };

        mainTR.apply = (b) => b.x = window.innerWidth; 

        mainBL.apply = (b) => b.y = window.innerHeight;

        mainBR.apply = (b) => {
            b.x = window.innerWidth
            b.y = window.innerHeight;
        };

        this.stage.addChild(bgr, mainTL, mainTR, mainBL, mainBR);
        
        // ocEvent.x = 480;
        // ocEvent.y = 245;
        // ocTeaser.y = 100;

        // this.stage.addChild(ocEvent, ocTeaser, mainTr);
    }

    /**
     * 
     * @param { LoadingBar } loading
     */
    async loadTextures(loading) {
        const graphics = {
            "default_button": Button.loadGraphic("default"),
            "yellow_button": Button.loadGraphic("yellow"),
            "blue_button": Button.loadGraphic("blue"),
            "red_button": Button.loadGraphic("red"),
            "disabled_button": Button.loadGraphicDisabled(),
            "default_input": Input.loadGraphic("default"),
        };

        const images = {
            "loading_image": "src/assets/images/loading_screens/loading_2025_lumi.png",
            "shelly_portrait": "src/assets/images/portraits/shelly_portrait.png",
            "solo_showdown": "src/assets/images/gamemodes/solo_showdown.png",
            "brawl_pass": "src/assets/images/misc/brawl_pass.png",
            "icon_quest": "src/assets/images/misc/icon_quest.png",
            "icon_xp": "src/assets/images/misc/icon_xp.png",
            "lumi_lobby": "src/assets/images/lobby_backgrounds/lumi_lobby.png",
            "icon_brawlers": "src/assets/images/misc/icon_brawlers.png",
            "icon_shop": "src/assets/images/misc/icon_shop.png",
            "profile_default": "src/assets/images/profile_icons/profile_default.png",
            "icon_trophy": "src/assets/images/misc/icon_trophy.png",
            "icon_trophy_tier_0": "src/assets/images/misc/icon_trophy_tier_0.png",
            "icon_menu": "src/assets/images/misc/icon_menu.png",
            "icon_coin": "src/assets/images/misc/icon_coin.png",
            "icon_gem": "src/assets/images/misc/icon_gem.png",
            "icon_bling": "src/assets/images/misc/icon_bling.png",
            "icon_back": "src/assets/images/misc/icon_back.png",
            "icon_home": "src/assets/images/misc/icon_home.png",
        };

        const videos = {
            "brawl_lobby_animated": "src/assets/videos/brawl_lobby_animated.mp4"
        }

        let steps = Object.keys({ ...graphics, ...images, ...videos }).length;
        let currentStep = 0;

        for (let graphic of Object.entries(graphics)) {
            let texture = this.renderer.generateTexture({
                target: graphic[1],
                resolution: 2
            });
            this._textures[graphic[0]] = texture;
            await new Promise(res => setTimeout(res, 10));
            progress();
        }

        for (let image of Object.entries(images)) {
            let texture = await Assets.load(image[1]);
            this._textures[image[0]] = texture;
            await new Promise(res => setTimeout(res, 10));
            progress();
        }

        for (let video of Object.entries(videos)) {
            let texture = await Assets.load(video[1]);
            this._textures[video[0]] = texture;
            await new Promise(res => setTimeout(res, 10));
            progress();
        }

        function progress() {
            currentStep++;
            loading.setLoaded(currentStep / steps * 100);
            loading.setText(`${Math.round(currentStep / steps * 100)}%`);
        }
    }

    getTexture(name) {
        return this._textures[name];
    }

    async showLoading() {
        await Assets.load({ alias: "Lilita One", src: lilitaOne });
        await Assets.load({ alias: "loading_image", src: loadingImage })

        let loadingContainer = new LoadingScreen(this);
        this.stage.addChild(loadingContainer);

        return loadingContainer;
    }

    updateUserData(data) {
        this.userData = data;
    }
}