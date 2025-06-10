import { Container, SCALE_MODES } from "pixi.js";
import { ColorTransform } from "../../classes/swf_objects/ColorTransform";
import { Matrix2x3 } from "../../classes/swf_objects/Matrix2x3";
import { MovieClip } from "../../classes/swf_objects/MovieClip";
import { Shape } from "../../classes/swf_objects/Shape";
import { TextField } from "../../classes/swf_objects/TextField";
import { MovieClipModifierOriginal } from "../../classes/swf_objects/MovieClipModifierOriginal";
import { ShapeComponent } from "./Shape";
import { TextFieldComponent } from "./TextField";
import { MovieClipModifierComponent } from "./MovieClipModifier";
import { MathHelper } from "../../classes/MathHelper";

export class MovieClipComponent extends Container {
    movieClip;
    timelineChildren = [];
    renderized = false;
    currentFrame = 0;
    currentMask = null;
    creatingMask = false;
    applyingMask = false;
    maskChildIndex = 0;
    msPerFrame = 0;
    lastFrameTime = 0;
    state = "PLAYING";
    looping = true;
    start = 0;
    end = 0;
    recursive = true;
    colorTransform = new ColorTransform();
    matrix2x3 = new Matrix2x3();
    applyX = null;
    applyY = null;

    /**
     * 
     * @param {MovieClip} movieClip 
     */
    constructor(movieClip) {
        super();
        this.movieClip = movieClip;
        this.objectId = movieClip.id;

        this.end = this.movieClip.frames.length - 1;

        const children = this.movieClip.getTimelineChildren();

        for (let [i, child] of Object.entries(children)) {
            let component;
            if (child instanceof MovieClipModifierOriginal) {
                if (child.tag == 38) { // creating mask
                    component = new MovieClipModifierComponent(child);
                } else if ([39, 40].includes(child.tag)) {
                    // applying mask or stop applying mask
                    component = child.tag;
                }

                this.timelineChildren[i] = component;
            } else {
                if (child instanceof MovieClip) {
                    component = new MovieClipComponent(child);
                }

                if (child instanceof Shape) {
                    component = new ShapeComponent(child);
                }

                if (child instanceof TextField) {
                    component = new TextFieldComponent(child);
                }

                /* if (this.creatingMask) {
                    this.currentMask.addChild(component);
                    component.isMask = true;
                } else if (this.applyingMask) {
                    component.mask = this.currentMask;
                } */

                this.timelineChildren[i] = component;
            }
        }

        this.msPerFrame = 1000 / this.movieClip.fps;
    }

    render(colorTransform = new ColorTransform(), matrix2x3 = new Matrix2x3(), scalingGrid, name) {
        this.colorTransform = colorTransform;
        this.matrix2x3 = matrix2x3;

        if (!this.renderized) {
            this.label = name || this.movieClip.exportName;

            for (let [i, child] of Object.entries(this.timelineChildren)) {
                if (child.render && typeof child.render == "function") {
                    child.render(
                        colorTransform,
                        matrix2x3,
                        this.movieClip.scalingGrid,
                        this.movieClip.children[i].name,
                        this.movieClip.children[i].blend
                    );
                }
            }

            this.renderized = true;
        }

        this.currentMask = null;
        this.creatingMask = false;
        this.applyingMask = false;

        this.frameLoop();

        return this;
    }

    frameLoop(testing = false) {
        if (this.currentFrame < this.start || this.currentFrame > this.end) {
            if (this.looping) {
                if (this.state == "PLAYING_REVERSE") {
                    this.currentFrame = this.movieClip.frames.length - 1;
                }
                
                if (this.state == "PLAYING") {
                    this.currentFrame = 0;
                }
            } else {
                this.setState("STOPPED", false);
            }
        }

        this.setFrame(MathHelper.clamp(this.currentFrame, this.start, this.end));

        let frames = 1;

        if (this.lastFrameTime != 0 && !testing) {
            let timeTaken = Date.now() - this.lastFrameTime;
            frames = Math.round(timeTaken / this.msPerFrame);
        }

        if (this.state == "STOPPED" && !testing) {
            frames = 0;
        }

        if (this.state == "PLAYING_REVERSE") {
            this.currentFrame -= frames;
        } else {
            this.currentFrame += frames;
        }

        this.lastFrameTime = Date.now();
    }

    setFrame(i) {
        this.currentFrame = i;
        let frame = this.movieClip.frames[i];
        let childIndex = 0;

        if (!frame) {
            console.log(this.movieClip.frames.length - 1, i);
            return;
        }

        for (let child of this.timelineChildren) {
            if (typeof child != "number") {
                child.mask = undefined;
            }
        }

        for (let element of frame.elements) {
            const child = this.timelineChildren[element.childIndex];

            if (child == null) {
                continue;
            }

            if (child instanceof MovieClipModifierComponent) {
                this.currentMask = child;
                this.creatingMask = true;
                this.maskChildIndex = 0;
            } else {
                if (child == 39) {
                    while (this.currentMask.children.length > this.maskChildIndex) {
                        this.currentMask.removeChildAt(this.currentMask.children.length - 1);
                    }

                    this.creatingMask = false;
                    this.applyingMask = true;
                    continue;
                } else if (child == 40) {
                    this.applyingMask = false;
                    continue;
                }

                const childMatrix2x3 = Matrix2x3.fromMatrix(this.movieClip.swf.matrixBanks[this.movieClip.matrixBankIndex].getMatrix(element.matrixIndex));
                childMatrix2x3.multiply(this.matrix2x3);
                const childColorTransform = ColorTransform.fromColorTransform(this.movieClip.swf.matrixBanks[this.movieClip.matrixBankIndex].getColorTransform(element.colorTransformIndex));
                childColorTransform.multiply(this.colorTransform);

                if (child.render && typeof child.render == "function") {
                    child.render(
                        childColorTransform,
                        childMatrix2x3,
                        this.movieClip.scalingGrid,
                        this.movieClip.children[element.childIndex].name,
                        this.movieClip.children[element.childIndex].blend
                    )
                }

                if (this.creatingMask) {
                    this.currentMask.addChildAt(child, this.maskChildIndex++);
                    continue;
                } else if (this.applyingMask) {
                    child.mask = this.currentMask;
                } else {
                    child.mask = null;
                }

            }

            this.addChildAt(child, childIndex++);
        }

        while (this.children.length > childIndex) {
            this.removeChildAt(this.children.length - 1);
        }

        if (this.apply && typeof this.apply == "function") {
            this.apply(this);
        }
        
    }

    getChildByName(name, index = 0, current = { index: 0 }) {
        for (let child of this.timelineChildren) {
            if (!child.movieClip)
                continue;

            if (child.label == name) {
                if (current.index >= index) {
                    return child;
                } else {
                    console.log("not index")
                    current.index++;
                }
            }

            let component = child.getChildByName(name, index, current);

            if (component)
                return component;
        }
    }

    setState(state, recursive = this.recursive) {
        this.state = state;
        if (state == "STOPPED") {
            this.lastFrameTime = 0;
        }

        if (recursive) {
            for (let child of this.timelineChildren) {
                if (child instanceof MovieClipComponent) {
                    child.setState(state);
                }
            }
        }
    }

    setLooping(looping = true, recursive = this.recursive) {
        this.looping = looping;

        if (recursive) {
            for (let child of this.timelineChildren) {
                if (child instanceof MovieClipComponent) {
                    child.setLooping(looping);
                }
            }
        }
    }

    reset(recursive = this.recursive) {
        this.currentFrame = 0;
        this.lastFrameTime = 0;
        this.start = 0;
        this.end = this.movieClip.frames.length - 1;
        this.setState("PLAYING", recursive);

        if (recursive) {
            for (let child of this.timelineChildren) {
                if (child instanceof MovieClipComponent) {
                    child.reset();
                }
            }
        }
    }

    /**
     * Plays the movie clip until
     */
    playFromTo(start = 0, end = this.movieClip.frames.length - 1) {
        if (start < 0 || end > this.movieClip.frames.length - 1 || start > end) {
            throw new Error(`Some value is invalid: 0 < ${start} < ${end} < ${this.movieClip.frames.length - 1} (0 < start < end < frames)`);
        }

        this.reset(false);
        this.start = start;
        this.end = end;
    }

    setRecursive(value) { 
        this.recursive = value;
    }
}