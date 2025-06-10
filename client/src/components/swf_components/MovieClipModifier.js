import { Container } from "pixi.js";

export class MovieClipModifierComponent extends Container {
    constructor(modifier) {
        super();
        this.label = "Mask - " + modifier.id;
    }
}