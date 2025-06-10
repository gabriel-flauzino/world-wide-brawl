import { Container, Graphics, Sprite } from "pixi.js";
import { Image } from "./Image";
import { Button } from "./Button";
import { Game } from "../classes/Game";

export class BrawlersScreen extends Container {
    /**
     * 
     * @param { Game } game 
     */
    constructor(game) {
        super();

        const background = new Image(game.getTexture("brawl_lobby_animated"));
        background.texture.source.resource.loop = true;

        const blackRect = new Graphics()
            .rect(0, 0, game.originalWidth, 20)
            .fill("#000")

        const goBackButton = new Button(game, {
            height: 60
        });
        const backIcon = new Image(game.getTexture("icon_back"));
        backIcon.setHeight(39);
        backIcon.anchor.set(0.5);
        backIcon.position.set(goBackButton.bg.width / 2 + 10, goBackButton.bg.height / 2);
        goBackButton.content.addChild(backIcon);
        goBackButton.eventMode = "static";
        goBackButton.addEventListener("click", () => {
            this.destroy({ children: true });
        })

        const goHomeButton = new Button(game, {
            height: 60
        });
        const homeIcon = new Image(game.getTexture("icon_home"));
        homeIcon.setHeight(39);
        homeIcon.anchor.set(0.5);
        homeIcon.position.set(goHomeButton.bg.width / 2 - 10, goHomeButton.bg.height / 2);
        goHomeButton.content.addChild(homeIcon)

        this.addChild(background, blackRect, goBackButton, goHomeButton);

        game.scalesAndPositionManager.addPositionAndScale(background, {
            align: "center",
            vertical: "center"
        },{
            scale: "100%"
        })

        game.scalesAndPositionManager.addPositionAndScale(blackRect, {
            align: "start",
            vertical: "start"
        })

        game.scalesAndPositionManager.addPositionAndScale(goBackButton, {
            align: "start",
            vertical: "start",
            padX: -25,
            padY: -8
        })

        game.scalesAndPositionManager.addPositionAndScale(goHomeButton, {
            align: "end",
            vertical: "start",
            padX: -25,
            padY: -8
        })
    }
}