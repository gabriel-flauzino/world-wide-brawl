import { Container, Geometry, Mesh, Shader, Texture, ColorMatrixFilter } from "pixi.js";
import { FBResources, FBShape } from "../../flatbuffers/supercell-sfw";
import { ShapeDrawBitmapCommand } from "./ShapeDrawBitmapCommand";
import { ColorTransform } from "./ColorTransform";
import { Matrix2x3 } from "./Matrix2x3";
import * as _ from "lodash";

export class Shape {
    /**
     * @param {FBShape} fb 
     * @param {FBResources} resources 
     */
    constructor(swf, fb, resources) {
        this.swf = swf;
        this._fb = fb;
        this._resources = resources;

        this.id = fb.id();

        this.commands = new Array(fb.commandsLength());
        for (let i = 0; i < fb.commandsLength(); i++) {
            this.commands[i] = new ShapeDrawBitmapCommand(fb.commands(i), resources);
        }
    }

    getId() {
        return this.id;
    }
}