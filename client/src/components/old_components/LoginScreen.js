import { Assets, Container, Sprite, Text } from "pixi.js";
import { ShadowedText } from "./ShadowedText";
import { Game } from "../classes/Game";
import { DefaultText } from "./DefaultText";
import { drop } from "lodash";
import { Input } from "./Input";
import { Button } from "./Button";
import { Room } from "colyseus.js";
import { LobbyScreen } from "./LobbyScreen";
import gsap from "gsap";

export class LoginScreen extends Container {
    /**
     * 
     * @param {Game} game 
     * @param {Room} lobby 
     */
    constructor(game, lobby) {
        super();

        this.zIndex = 20;

        const background = new Sprite(game.getTexture("brawl_lobby_animated"));
        background.texture.source.resource.loop = true;
        const title = new ShadowedText({
            text: "Bem-vindo ao World Wide Brawl!",
            size: 30
        })
        const subtitle = new DefaultText({
            text: "Qual é o seu nome no jogo? Não use seu nome verdadeiro.",
            size: 15,
            style: {
                fill: "rgba(120,227,255,255)",
                dropShadow: {
                    color: "#000",
                    alpha: 1,
                    blur: 0,
                    pixelSize: 10,
                    distance: 0
                }
            }
        })
        const formContainer = new Container();
        const input = new Input(game, {
            width: 250,
            maxLength: 15,
            align: "center",
            placeholder: "Insira seu nome aqui",
        });
        formContainer.addChild(input)
        const submitButton = new Button(game, {
            width: 140,
            height: input.height,
            disabled: true,
            style: "blue"
        });
        const buttonText = new ShadowedText({
            text: "OK"
        })
        submitButton.content.addChild(buttonText);
        formContainer.addChild(submitButton);
        const loginButton = new Button(game, {
            height: 40,
            width: 130
        });
        const loginText = new ShadowedText({
            text: "Já jogou antes?",
            size: 15
        });
        const buttonLoginText = new ShadowedText({
            text: "Entrar com e-mail",
            size: 12
        })
        loginButton.content.addChild(buttonLoginText);
        buttonLoginText.anchor.set(0.5);
        buttonLoginText.position.set(loginButton.bg.width / 2, loginButton.bg.height / 2)
        
        buttonText.anchor.set(0.5);
        buttonText.position.set(submitButton.bg.width / 2, submitButton.bg.height / 2 - 3)
        submitButton.x = input.width - 11;
        input.placeholder.resolution = 2;
        input.inputField.resolution = 2;
        
        this.addChild(background, title, subtitle, formContainer, loginButton, loginText);

        let locked = false;

        input.onChange.connect(value => {
            if (locked)
                return;

            let disabled = value.length < 1 || value.length > 15;
                
            submitButton.setDisabled(disabled);
        })

        submitButton.on("pointerup", e => {
            if (submitButton.disabled)
                return;

            locked = true;
            submitButton.setDisabled(true);

            lobby.removeAllListeners();

            lobby.onMessage("registrationError", () => {
                alert("Não foi possível registrar.");
                location.reload();
            })

            lobby.onMessage("authenticated", message => {
                localStorage.setItem("auth_token", message.user.token);
                lobby.removeAllListeners();
                game.updateUserData(message.user);
                const lobbyScreen = new LobbyScreen(game, lobby);
                game.stage.addChild(lobbyScreen);
                this.remove();
            })

            lobby.send("register", { username: input.value });
        })

        game.scalesAndPositionManager.addPositionAndScale(background, {
            align: "center",
        },{
            scale: "100%"
        })
        game.scalesAndPositionManager.addPositionAndScale(title, {
            align: "center",
            y: 20
        });
        game.scalesAndPositionManager.addPositionAndScale(subtitle, {
            align: "center",
            y: 70
        });
        game.scalesAndPositionManager.addPositionAndScale(formContainer, {
            align: "center",
            y: 100
        });

        game.scalesAndPositionManager.addPositionAndScale(loginButton, {
            align: "start",
            vertical: "start"
        })

        game.scalesAndPositionManager.addPositionAndScale(loginText, {
            align: "start",
            padX: 8
        })

        game.scalesAndPositionManager.addPositionAndScale(loginButton, {
            align: "start",
            padX: 12,
            padY: 25,
        })   
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