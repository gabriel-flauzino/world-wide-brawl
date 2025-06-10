import { Container } from "pixi.js";

export class Wrapper extends Container {
    constructor(game) {
        super();
        this.game = game;
    }

    render(...args) {
        this.children.forEach(c => {
            if (c.render && typeof c.render == "function") {
                c.render();
            } 
        })
    }
}