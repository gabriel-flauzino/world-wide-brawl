import { FBResources, FBShape } from "../../flatbuffers/supercell-sfw";
import { SupercellSWF } from "../SupercellSWF";
import { ShapeDrawBitmapCommand } from "./ShapeDrawBitmapCommand";

export class Shape {
    swf;
    /**
     * @type {ShapeDrawBitmapCommand[]}
     */
    commands;

    /**
     * @param {SupercellSWF} swf
     * @param {FBShape} fb 
     * @param {FBResources} resources 
     */
    constructor(swf, fb, resources) {
        this.swf = swf;
        this.id = fb.id();

        this.commands = new Array(fb.commandsLength());
        for (let i = 0; i < fb.commandsLength(); i++) {
            this.commands[i] = new ShapeDrawBitmapCommand(fb.commands(i), resources);
        }
    }
}