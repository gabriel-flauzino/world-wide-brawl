import { Container, Graphics, Sprite } from "pixi.js";
import { Game } from "../classes/Game";
import { Button } from "./Button";
import { ShadowedText } from "./ShadowedText";
import { DefaultText } from "./DefaultText";
import { Image } from "./Image";
import { LoadingBar } from "./LoadingBar";
import { Vibrant } from "node-vibrant/browser";
import { BrawlersScreen } from "./BrawlersScreen";

export class LobbyScreen extends Container {
    /**
     * 
     * @param { Game } game 
     */
    constructor(game) {
        super();
        const blackRect = new Graphics()
            .rect(0, 0, game.originalWidth, 20)
            .fill("#000")
        const background = new Sprite(game.getTexture("lumi_lobby"));
        const gamemodeContainer = new Container();
        const blackBg = new Graphics()
            .roundRect(0, 0, 314, 18, 2)
            .fill("#000")
        blackBg.skew.set(-0.0874887, 0)
        blackBg.x = 1.5;
        const button = new Button(game, {
            width: 314,
            height: 60
        });
        button.y = 15;
        const gamemodeName = new ShadowedText({
            text: "COMBATE SOLITÁRIO",
            size: 17,
        })
        gamemodeName.anchor.set(0, 1);
        gamemodeName.position.set(68, button.bg.height / 2 + 2);
        const gamemodeMap = new ShadowedText({
            text: "Brawl do brô",
            size: 16
        })
        gamemodeMap.position.set(68, button.bg.height / 2);
        const gamemodeIcon = new Image(game.getTexture("solo_showdown"));
        gamemodeIcon.setWidth(49);
        gamemodeIcon.x = 10;
        button.content.addChild(gamemodeIcon, gamemodeName, gamemodeMap);
        gamemodeContainer.addChild(blackBg, button)
        const yellowButton = new Button(game, {
            style: "yellow",
            width: 225,
            height: 75
        })
        const playButtonText = new ShadowedText({
            text: "JOGAR",
            size: 30
        })
        yellowButton.content.addChild(playButtonText);
        playButtonText.anchor.set(0.5);
        playButtonText.position.set(yellowButton.bg.width / 2 - 3, yellowButton.bg.height / 2 - 3);

        const brawlpassButton = new Button(game, {
            width: 136,
            height: 60
        })
        const brawlpassIcon = new Image(game.getTexture("brawl_pass"));
        brawlpassIcon.setWidth(100);
        brawlpassIcon.position.set(-8, -32);
        const xpIcon = new Image(game.getTexture("icon_xp"));
        xpIcon.setWidth(34)
        xpIcon.y = 24;
        const brawlpassProgress = new LoadingBar(game, {
            style: "brawlpass",
            width: 100,
            height: 20
        });
        brawlpassProgress.y = brawlpassButton.bg.height - brawlpassProgress.height - 7;
        brawlpassProgress.x = 29;
        brawlpassProgress.setLoaded(50)
        brawlpassButton.content.addChild(brawlpassProgress, brawlpassIcon, xpIcon);

        const questsButton = new Button(game, {
            width: 76,
            height: 60
        })
        const questsIcon = new Image(game.getTexture("icon_quest"))
        questsIcon.setWidth(50);
        questsIcon.anchor.set(0.5, 0);
        questsIcon.position.set(questsButton.bg.width / 2 - 3, -33)
        const questsText = new ShadowedText({
            text: "MISSÕES",
            size: 14
        });
        questsText.anchor.set(0.5);
        questsText.position.set(questsButton.bg.width / 2 - 3, questsButton.bg.height - questsText.height)
        questsButton.content.addChild(questsIcon, questsText);

        const sidebuttonsLeft = new Container();
        const shopButton = new Button(game, {
            width: 71,
            height: 40
        });
        const shopText = new ShadowedText({
            text: "LOJA",
            size: 13
        })
        shopText.x = (shopButton.bg.width - shopText.width) / 2;
        shopText.y = (shopButton.bg.height - shopText.height) - 1;
        const shopIcon = new Image(game.getTexture("icon_shop"));
        shopIcon.setWidth(38)
        shopIcon.anchor.set(0.5, 1);
        shopIcon.position.set(shopButton.bg.width / 2 - 1, shopButton.bg.height / 2 + 5);
        shopButton.content.addChild(shopIcon, shopText);
        const brawlersButton = new Button(game, {
            width: 71,
            height: 40
        });
        const brawlersText = new ShadowedText({
            text: "BRAWLERS",
            size: 13
        })
        brawlersText.x = (brawlersButton.bg.width - brawlersText.width) / 2 - 2;
        brawlersText.y = (brawlersButton.bg.height - brawlersText.height) - 1;
        const brawlersIcon = new Image(game.getTexture("icon_brawlers"));
        brawlersIcon.setWidth(58)
        brawlersIcon.anchor.set(0.5, 1);
        brawlersIcon.position.set(brawlersButton.bg.width / 2 - 1, brawlersButton.bg.height / 2 + 5);
        brawlersButton.content.addChild(brawlersIcon, brawlersText);
        brawlersButton.y = 50;
        brawlersButton.eventMode = "static";
        brawlersButton.addEventListener("pointerup", () => {
            let screen = new BrawlersScreen(game);
            game.stage.addChild(screen);
        })
        const starrRoadButton = new Button(game, {
            width: 71,
            height: 40
        });
        starrRoadButton.y = 100;
        sidebuttonsLeft.addChild(shopButton, brawlersButton, starrRoadButton);

        const sidebuttonsRight = new Container();
        const newsButton = new Button(game, {
            width: 71,
            height: 40
        });
        const newsText = new ShadowedText({
            text: "NEWS"
        })
        newsButton.content.addChild(newsText);
        const friendsButton = new Button(game, {
            width: 71,
            height: 40
        });
        const friendsText = new ShadowedText({
            text: "FRIENDS"
        })
        friendsButton.content.addChild(friendsText);
        friendsButton.y = 50;
        const clubButton = new Button(game, {
            width: 71,
            height: 40
        });
        const clubText = new ShadowedText({
            text: "CLUB"
        })
        clubButton.content.addChild(clubText);
        clubButton.y = 100;
        sidebuttonsRight.addChild(newsButton, friendsButton, clubButton);

        const profileButton = new Button(game, {
            width: 100,
            height: 66
        });
        const avatar = new Image(game.getTexture("profile_default"));
        avatar.setWidth(50);
        avatar.anchor.set(0.5, 0)
        avatar.x = profileButton.width / 2 - 5;
        avatar.y = 7;
        const username = new ShadowedText({
            text: game.userData.username,
            size: 15
        })
        username.anchor.set(0.5, 1);
        username.x = profileButton.bg.width / 2 - 5;
        username.y = profileButton.bg.height;
        profileButton.content.addChild(avatar, username);
        const trophyRoadButton = new Button(game, {
            height: 66,
            width: 146
        });
        const trophyProgress = new LoadingBar(game, {
            style: "default_2",
            height: 15,
            width: 126
        });
        trophyProgress.y = trophyRoadButton.bg.height - trophyProgress.height - 7;
        trophyProgress.x = 3;
        trophyProgress.setLoaded(50)
        const trophyCount = new ShadowedText({
            text: "63794",
            style: {
                fill: "#ffbe20"
            }
        })
        trophyCount.x = 70;
        trophyCount.y = 12;
        const trophyIcon = new Image(game.getTexture("icon_trophy"));
        trophyIcon.setWidth(26)
        trophyIcon.x = 42;
        trophyIcon.y = 13;
        trophyIcon.rotation = 0.1;
        const trophyTier = new Image(game.getTexture("icon_trophy_tier_0"));
        trophyTier.setWidth(33);
        trophyTier.x = 5;
        trophyTier.y = 3;
        trophyTier.alpha = 0.4;
        trophyRoadButton.content.addChild(trophyProgress, trophyCount, trophyIcon, trophyTier);
        const menuButton = new Button(game, {
            width: 71,
            height: 40
        });
        const menuIcon = new Image(game.getTexture("icon_menu"));
        menuIcon.setWidth(28)
        menuIcon.anchor.set(0.5, 0.5);
        menuIcon.position.set(menuButton.bg.width / 2 - 1, menuButton.bg.height / 2 - 1);
        menuButton.content.addChild(menuIcon)

        const currenciesBgs = new Graphics()
            .rect(0, 0, 80, 25)
            .fill("#000");

        const coinCont = new Container();
        const coinBg = currenciesBgs.clone(true);
        coinBg.skew.set(-0.0874887, 0);
        coinBg.x = 12;
        const coinIcon = new Image(game.getTexture("icon_coin"));
        coinIcon.setWidth(25);
        const coinsCount = new DefaultText({
            text: "0",
            style: {
                fill: "#fff"
            }
        });
        coinsCount.anchor.set(0.5, 0.5);
        coinsCount.position.set(coinBg.width / 2 + 16, coinBg.height / 2);
        coinCont.addChild(coinBg, coinIcon, coinsCount);

        const gemCont = new Container();
        const gemBg = currenciesBgs.clone(true);
        gemBg.skew.set(-0.0874887, 0);
        gemBg.x = 12;
        const gemIcon = new Image(game.getTexture("icon_gem"));
        gemIcon.setWidth(25);
        const gemsCount = new DefaultText({
            text: "0",
            style: {
                fill: "#fff"
            }
        });
        gemsCount.anchor.set(0.5, 0.5);
        gemsCount.position.set(gemBg.width / 2 + 16, gemBg.height / 2);
        gemCont.addChild(gemBg, gemIcon, gemsCount);

        const blingCont = new Container();
        const blingBg = currenciesBgs.clone(true);
        blingBg.skew.set(-0.0874887, 0);
        blingBg.x = 12;
        const blingIcon = new Image(game.getTexture("icon_bling"));
        blingIcon.setWidth(25);
        const blingsCount = new DefaultText({
            text: "0",
            style: {
                fill: "#fff"
            }
        });
        blingsCount.anchor.set(0.5, 0.5);
        blingsCount.position.set(blingBg.width / 2 + 16, blingBg.height / 2);
        blingCont.addChild(blingBg, blingIcon, blingsCount);

        this.addChild(
            background,
            blackRect,
            gamemodeContainer,
            yellowButton, brawlpassButton,
            questsButton,
            sidebuttonsLeft, sidebuttonsRight,
            profileButton,
            trophyRoadButton,
            menuButton,
            coinCont,
            gemCont,
            blingCont
        );

        game.scalesAndPositionManager.addPositionAndScale(blackRect, {
            align: "start",
            vertical: "start"
        })

        game.scalesAndPositionManager.addPositionAndScale(background, {
            align: "center",
            vertical: "center"
        }, {
            scale: "100%",
            scaleMode: "x"
        })
        game.scalesAndPositionManager.addPositionAndScale(gamemodeContainer, {
            align: "end",
            vertical: "end",
            padX: 240,
            padY: 10,
        }, {

        })
        game.scalesAndPositionManager.addPositionAndScale(yellowButton, {
            align: "end",
            vertical: "end",
            padX: 3,
            padY: 10
        })

        game.scalesAndPositionManager.addPositionAndScale(brawlpassButton, {
            align: "start",
            vertical: "end",
            padX: 16,
            padY: 10 - 32
        })

        game.scalesAndPositionManager.addPositionAndScale(questsButton, {
            align: "start",
            vertical: "end",
            padX: 161,
            padY: 10 - 33,
        })

        game.scalesAndPositionManager.addPositionAndScale(sidebuttonsLeft, {
            align: "start",
            vertical: "center",
            padX: 14
        })

        game.scalesAndPositionManager.addPositionAndScale(sidebuttonsRight, {
            align: "end",
            vertical: "center",
            padX: 10
        })

        game.scalesAndPositionManager.addPositionAndScale(profileButton, {
            align: "start",
            vertical: "start",
            padX: 16,
            padY: 7
        })

        game.scalesAndPositionManager.addPositionAndScale(trophyRoadButton, {
            align: "start",
            vertical: "start",
            padX: 124,
            padY: 7
        })

        game.scalesAndPositionManager.addPositionAndScale(menuButton, {
            align: "end",
            vertical: "start",
            padX: 3,
            padY: 7
        })

        game.scalesAndPositionManager.addPositionAndScale(coinCont, {
            align: "end",
            vertical: "start",
            padX: 180,
            padY: 7
        })

        game.scalesAndPositionManager.addPositionAndScale(gemCont, {
            align: "end",
            vertical: "start",
            padX: 85,
            padY: 7
        })

        game.scalesAndPositionManager.addPositionAndScale(blingCont, {
            align: "end",
            vertical: "start",
            padX: 275,
            padY: 7
        })
    }
}