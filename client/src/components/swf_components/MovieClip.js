import { Container, SCALE_MODES } from "pixi.js";
import { ColorTransform } from "../../classes/swf_objects/ColorTransform";
import { Matrix2x3 } from "../../classes/swf_objects/Matrix2x3";
import { MovieClip } from "../../classes/swf_objects/MovieClip";
import { Shape } from "../../classes/swf_objects/Shape";
import { TextField } from "../../classes/swf_objects/TextField";
import { MovieClipModifier } from "../../classes/swf_objects/MovieClipModifier";
import { ShapeComponent } from "./Shape";
import { TextFieldComponent } from "./TextField";
import { MovieClipModifierComponent } from "./MovieClipModifier";
import { MathHelper } from "../../classes/MathHelper";

export class MovieClipComponent extends Container {
    movieClip;
    /**
     * @type { Array<MovieClipComponent | ShapeComponent | TextFieldComponent | MovieClipModifierComponent> }
     */
    timelineChildren = [];
    renderized = false;
    currentFrame = 0;
    currentMask = null;
    creatingMask = false;
    applyingMask = false;
    maskAppliedOnce = false;
    maskChildIndex = 0;
    msPerFrame = 0;
    /**
     * How long the movie clip takes to end.
     */
    duration = 0;
    lastFrameTime = 0;
    /**
     * @type {"PLAYING" | "STOPPED" | "PLAYING_REVERSE"}
     */
    state = "PLAYING";
    /**
     * @type {"PLAYING" | "STOPPED" | "PLAYING_REVERSE" | undefined}
     */
    lastState;
    looping = true;
    start = 0;
    end = 0;
    recursive = true;
    colorTransform = new ColorTransform();
    matrix2x3 = new Matrix2x3();
    frameTime = 0;
    /**
     * A function can be assigned to apply custom properties after default rendering, such as custom scale and position.
     * @type { (b: this) => any }
     */
    apply;
    /**
     * @type {Set<number>}
     */
    hiddenChildren = new Set();
    /**
     * @type {Array<number>}
     */
    hiddenObjectIds = [];
    textMap = {};

    /**
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
            if (child instanceof MovieClipModifier) {
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

                this.timelineChildren[i] = component;
            }
        }

        this.msPerFrame = 1000 / this.movieClip.fps;
        this.duration = this.msPerFrame * this.movieClip.frames.length;
    }

    render(colorTransform = new ColorTransform(), matrix2x3 = new Matrix2x3(), scalingGrid, name, blend, deltaMS = 0, textMap = {}, hiddenObjectIds = []) {
        this.colorTransform = colorTransform;
        this.matrix2x3 = matrix2x3;

        let spreadedTextMap = { ...textMap, ...this.textMap };
        let spreadedHiddenObjectIds = [...hiddenObjectIds, ...this.hiddenObjectIds];

        if (!this.renderized) {
            this.label = name || this.movieClip.exportName;

            for (let [i, child] of Object.entries(this.timelineChildren)) {
                if (child.render && typeof child.render == "function") {
                    child.render(
                        colorTransform,
                        matrix2x3,
                        this.movieClip.scalingGrid,
                        this.movieClip.children[i].name,
                        this.movieClip.children[i].blend,
                        deltaMS,
                        spreadedTextMap
                    );
                }
            }

            this.renderized = true;
        }

        this.currentMask = null;
        this.creatingMask = false;
        this.applyingMask = false;

        this._frameLoop(deltaMS, spreadedTextMap, spreadedHiddenObjectIds);

        return this;
    }

    /**
     * Changes the state to PLAYING, STOPPED, PLAYING_REVERSE
     * @param {"PLAYING" | "STOPPED" | "PLAYING_REVERSE"} state 
     * @param {boolean} recursive Whether to set the state of children.
     */
    setState(state, recursive = this.recursive) {
        this.lastState = this.state;
        this.state = state;
        if (this.state == "PLAYING_REVERSE") {
            this.frameTime = this.duration;
        } else if (this.state == "PLAYING") {
            this.frameTime = 0;
        }


        if (recursive) {
            for (let child of this.timelineChildren) {
                if (child instanceof MovieClipComponent) {
                    child.setState(state);
                }
            }
        }

        return this;
    }

    /**
     * Sets whether the movie clip will loop.
     * @param {boolean} looping
     * @param {boolean} recursive Whether to set looping of children.
     */
    setLooping(looping = true, recursive = this.recursive) {
        this.looping = looping;

        if (recursive) {
            for (let child of this.timelineChildren) {
                if (child instanceof MovieClipComponent) {
                    child.setLooping(looping);
                }
            }
        }

        return this;
    }

    /**
     * Resets state, start and end to default values. Also plays the animation from start.
     * This method does not reset the `looping` property.
     * @param {boolean} recursive Whether to reset children.
     */
    reset(recursive = this.recursive) {
        this.frameTime = 0;
        this.start = 0;
        this.end = this.movieClip.frames.length - 1;
        this.duration = (this.end - this.start) * this.msPerFrame;
        this.setState("PLAYING", recursive);

        if (recursive) {
            for (let child of this.timelineChildren) {
                if (child instanceof MovieClipComponent) {
                    child.reset();
                }
            }
        }

        return this;
    }

    /**
     * Sets where the animation must start and end.
     * This method calls the {@link MovieClipComponent#reset} method.
     * @param {number} start The frame where the animation will start.
     * @param {number} end The frame where the animation will end.
     */
    playFromTo(start = 0, end = this.movieClip.frames.length - 1) {
        if (start < 0 || end > this.movieClip.frames.length - 1 || start > end) {
            throw new Error(`Some value is invalid: 0 < ${start} < ${end} < ${this.movieClip.frames.length - 1} (0 < start < end < frames)`);
        }

        this.reset(false);
        this.start = start;
        this.end = end;
        this.duration = (this.end - this.start) * this.msPerFrame;
        this.frameTime = 0;

        return this;
    }

    /**
     * Sets the default value for every method that have recursivity option.
     * The default value for recursivity is `true`.
     * @param {boolean} value 
     */
    setRecursive(value) {
        this.recursive = value;

        return this;
    }

    /**
     * Sets and render a frame.
     * @param {number} i The frame index.
     * @param {boolean} stop Whether to set the state to "STOPPED" (non-recursive). Default is `true`. 
     */
    setCurrentFrame(i, stop = true) {
        this.currentFrame = i;
        this.frameTime == i * this.msPerFrame;
        if (stop) {
            this.setState("STOPPED", false);
        }

        return this;
    }

    replay() {
        if (this.state != "STOPPED") {
            throw new Error("MovieClip is not stopped.");
        }
        this.frameTime = 0;
        this.setState(this.lastState || "PLAYING");
    }

    /**
     * Sets the frame of the MovieClip by the frame label.
     * @param {string} label 
     * @param {boolean} stop Whether to set the state to "STOPPED". Default is `true`.
     */
    setCurrentFrameByLabel(label, stop = true) {
        let frameIndex = this.movieClip.frames.findIndex(x => x.label == label);
        if (frameIndex > -1) {
            this.setCurrentFrame(frameIndex, stop);
        } else {
            throw new Error(`Label ${label} not found.`);
        }

        return this;
    }

    /**
     * Returns a child by it's `objectId`.
     * @param {number} objectId 
     * @param {number} index The index of the child. For example, 0 will return the first child that matches the id. Default is `0`.
     * @param {object} current Internal argument for recursive function. Do not use. 
     * @returns {MovieClipComponent | ShapeComponent | TextFieldComponent | MovieClipModifierComponent}
     */
    getChildById(objectId, index, current = { index: 0 }) {
        for (let child of this.timelineChildren) {
            if (typeof child == "number")
                continue;

            if (child.label == objectId) {
                if (current.index >= index) {
                    return child;
                } else {
                    current.index++;
                }
            }

            let component = child.getChildById(objectId, index, current);

            if (component)
                return component;
        }
    }

    /**
     * Finds a child (or child of it children) by a name.
     * @param {string} name The name of child.
     * @param {number} index The index of the child. For example, 0 will return the first child that matches the name. Default is `0`.
     * @param {object} current Internal argument for recursive function. Do not use. 
     * @returns {MovieClipComponent | ShapeComponent | TextFieldComponent | MovieClipModifierComponent}
     */
    getChildByName(name, index = 0, current = { index: 0 }) {
        for (let child of this.timelineChildren) {
            if (typeof child == "number")
                continue;

            if (child.label == name) {
                if (current.index >= index) {
                    return child;
                } else {
                    current.index++;
                }
            }

            let component = child.getChildByName(name, index, current);

            if (component)
                return component;
        }
    }

    /**
     * Returns every child that matches `objectId`.
     * @param {number} objectId 
     */
    getEveryChildById(objectId) {
        let children = [];
        for (let child of this.timelineChildren) {
            if (typeof child == "number")
                continue;

            if (child.objectId == objectId) {
                children.push(child);
            }

            if (child instanceof MovieClipComponent) {
                children = children.concat(child.getEveryChildById(objectId));
            }
        }

        return children;
    }

    /**
     * Returns every child that matches a name.
     * @param {string} name 
     * @returns {Array<MovieClipComponent | ShapeComponent | TextFieldComponent | MovieClipModifierComponent>}
     */
    getEveryChildByName(name) {
        let children = [];
        for (const child of this.timelineChildren) {
            if (typeof child == "number")
                continue;

            if (child.label == name) {
                children.push(child);
            }

            if (child instanceof MovieClipComponent) {
                children = children.concat(child.getEveryChildByName(name));
            }
        }

        return children;
    }

    /**
     * Same as {@link MovieClipComponent.getChildById getChildById}, but only for MovieClips.
     * @param {number} objectId 
     * @param {number} index The index of the child. For example, 0 will return the first child that matches the id. Default is `0`.
     * @returns {MovieClipComponent}
     */
    getMovieClipById(objectId, index) {
        let child = this.getChildById(objectId, index);
        if (child instanceof MovieClipComponent) {
            return child;
        } else {
            throw new Error(`Child with objectId ${objectId} is not a MovieClip.`);
        }
    }

    /**
     * Same as {@link MovieClipComponent.getChildByName getChildByName}, but only for MovieClips.
     * @param {string} name 
     * @param {number} index The index of the child. For example, 0 will return the first child that matches the name. Default is `0`.
     * @returns {MovieClipComponent}
     */
    getMovieClipByName(name, index) {
        let child = this.getChildByName(name, index);
        if (child instanceof MovieClipComponent) {
            return child;
        } else {
            throw new Error(`Child with name ${name} is not a MovieClip.`);
        }
    }

    /**
     * Same as {@link MovieClipComponent.getChildById getChildById}, but only for TextFields.
     * @param {number} objectId 
     * @param {number} index The index of the child. For example, 0 will return the first child that matches the id. Default is `0`.
     * @returns {TextFieldComponent}
     */
    getTextFieldById(objectId, index) {
        let child = this.getChildById(objectId, index);
        if (child instanceof TextFieldComponent) {
            return child;
        } else {
            throw new Error(`Child with objectId ${objectId} is not a TextField.`);
        }
    }

    /**
     * Same as {@link MovieClipComponent.getChildByName getChildByName}, but only for TextFields.
     * @param {string} name 
     * @param {number} index The index of the child. For example, 0 will return the first child that matches the name. Default is `0`.
     * @returns {TextFieldComponent}
     */
    getTextFieldByName(name, index) {
        let child = this.getChildByName(name, index);
        if (child instanceof TextFieldComponent) {
            return child;
        } else {
            throw new Error(`Child with name ${name} is not a TextField.`);
        }
    }

    /**
     * Hides a child by unique element UID.
     * @param {number} uid 
     * @returns 
     */
    hideChildById(uid) {
        this.hiddenChildren.add(uid);

        return this;
    }

    /**
     * Hides a child by it's name.
     * @param {string} name 
     * @param {number} index The index of the child. For example, 0 will return the first child that matches the name. Default is `0`.
     * @returns 
     */
    hideChildByName(name, index) {
        let child = this.getChildByName(name, index);
        if (!child) {
            console.warn("Could not hide child with name " + name + ". Not found.");
            return this;
        }

        child.parent.hideChildById(child.uid);

        return this;
    }

    /**
     * Hides every child that matches `objectId`.
     * @param {number} objectId 
     */
    hideEveryChildById(objectId) {
        this.hiddenObjectIds.push(objectId);

        return this;
    }

    /**
     * Hides every child that matches a name.
     * @param {string} name
     */
    hideEveryChildByName(name) {
        let children = this.getEveryChildByName(name);
        if (!children[0]) {
            console.warn("Could not hide every child with name " + name + ". No children found.");
            return this;
        }

        children.forEach(c =>
            c.parent.hideChildById(c.uid)
        )

        return this;
    }

    showChild(id) {
        this.hiddenChildren.delete(id);

        return this;
    }

    showChildByName(name, index) {
        let child = this.getChildByName(name, index);
        child.parent.showChild(child.uid);

        return this;
    }

    mapText(key, value) {
        this.textMap[key] = value;
    }

    getMappedText(key) {
        return this.textMap[key];
    }

    /**
     * Internal method for playing the animation. 
     */
    _frameLoop(deltaMS, textMap, hiddenObjectIds) {
        this._setFrame(MathHelper.clamp(this.currentFrame, this.start, this.end), deltaMS, textMap, hiddenObjectIds);

        if (this.state != "STOPPED") {
            let totalFrames = this.end - this.start;

            if (this.state == "PLAYING_REVERSE") {
                this.frameTime -= deltaMS || 0;
            } else {
                this.frameTime += deltaMS || 0;
            }

            let elapsedFrames = Math.floor(this.frameTime / this.msPerFrame);
            let frame = MathHelper.mod(elapsedFrames, totalFrames);
            if (isNaN(frame)) {
                frame = 0;
            }

            if (!this.looping) {
                if (this.state == "PLAYING_REVERSE") {
                    if (elapsedFrames <= -totalFrames) {
                        frame = this.start;
                        this.lastState = this.state;
                        this.setState("STOPPED");
                    }
                } else {
                    if (elapsedFrames >= totalFrames) {
                        frame = this.end;
                        this.lastState = this.state;
                        this.setState("STOPPED");
                    }
                }

            }

            this.currentFrame = frame;
        }
    }

    _setFrame(i, deltaMS, textMap, hiddenObjectIds) {
        this.currentFrame = i;
        let frame = this.movieClip.frames[i];
        let childIndex = 0;

        if (!frame) {
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
                this.maskAppliedOnce = false;
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

                if (
                    this.hiddenChildren.has(child.uid) ||
                    this.hiddenObjectIds.includes(child.objectId)
                ) {
                    continue;
                }

                const childMatrix2x3 = Matrix2x3.fromMatrix(this.movieClip.swf.matrixBanks.getMatrix(this.movieClip.matrixBankIndex, element.matrixIndex));
                childMatrix2x3.multiply(this.matrix2x3);
                let a = this.movieClip.swf.matrixBanks.getColorTransform(this.movieClip.matrixBankIndex, element.colorTransformIndex);
                const childColorTransform = ColorTransform.fromColorTransform(a);
                childColorTransform.multiply(this.colorTransform);

                if (child.render && typeof child.render == "function") {
                    child.render(
                        childColorTransform,
                        childMatrix2x3,
                        this.movieClip.scalingGrid,
                        this.movieClip.children[element.childIndex].name,
                        this.movieClip.children[element.childIndex].blend,
                        deltaMS,
                        textMap,
                        hiddenObjectIds
                    )
                }

                if (this.creatingMask) {
                    this.currentMask.addChildAt(child, this.maskChildIndex++);
                    continue;
                } else if (this.applyingMask) {
                    child.mask = this.currentMask;
                    if (!this.maskAppliedOnce) {
                        this.addChildAt(this.currentMask, childIndex++);
                        this.maskAppliedOnce = true;
                    }
                } else {
                    child.mask = null;
                }

                this.addChildAt(child, childIndex++);
            }

        }

        while (this.children.length > childIndex) {
            this.removeChildAt(this.children.length - 1);
        }

        if (this.apply && typeof this.apply == "function") {
            this.apply(this);
        }

    }
}