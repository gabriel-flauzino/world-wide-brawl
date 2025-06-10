import { Sprite } from "pixi.js";
import { Game } from "../classes/Game";

export class Image extends Sprite {
    /**
     * 
     * @param {string} textureName 
     */
    constructor(texture) {
        super(texture);
    }

    /**
     * 
     * @param {number} value 
     */
    setWidth(value) {
        const aspectRatio = this.width / this.height;
        this.width = value;
        this.height = value / aspectRatio;
    }

    /**
     * 
     * @param {number} value 
     */
    setHeight(value) {
        const aspectRatio = this.height / this.width;
        this.height = value;
        this.width = value / aspectRatio;
    }
}