import { Rectangle } from "pixi.js";
import { FBMovieClip, FBResources } from "../../flatbuffers/supercell-sfw";
import { MovieClipFrame } from "./MovieClipFrame";
import { MovieClipChild } from "./MovieClipChild";
import { SupercellSWF } from "../SupercellSWF";

export class MovieClip {
    swf;
    id;
    exportName;
    fps;
    /**
     * @type {MovieClipChild[]}
     */
    children = [];
    /**
     * @type {MovieClipFrame[]}
     */
    frames = [];
    matrixBankIndex;
    /**
     * @param {SupercellSWF} swf
     * @param {FBMovieClip} fb 
     * @param {FBResources} resources 
     */
    constructor(swf, fb, resources) {
        this.swf = swf;
        this.id = fb.id();
        this.exportName = fb.exportNameRefId() !== 0 ? resources.strings(fb.exportNameRefId()) : null;
        this.fps = fb.fps();

        for (let i = 0; i < fb.childIdsLength(); i++) {
            this.children.push(new MovieClipChild(
                fb.childIds(i),
                fb.childBlends(i),
                fb.childNameRefIdsLength() !== 0 ? resources.strings(fb.childNameRefIds(i)) : null
            ));
        }

        let frameElementOffset = fb.frameElementOffset() / 3;

        if (fb.framesLength() > 0) {
            for (let i = 0; i < fb.framesLength(); i++) {
                const fbFrame = fb.frames(i);
                const frame = new MovieClipFrame(fbFrame, resources, frameElementOffset);
                frameElementOffset += frame.getElementCount();
                this.frames.push(frame);
            }
        } else {
            for (let i = 0; i < fb.shortFramesLength(); i++) {
                const fbFrame = fb.shortFrames(i);
                const frame = new MovieClipFrame(fbFrame, resources, frameElementOffset);
                frameElementOffset += frame.getElementCount();
                this.frames.push(frame);
            }
        }

        this.matrixBankIndex = fb.matrixBankIndex();

        const scalingGridIndex = fb.scalingGridIndex();
        if (scalingGridIndex !== -1) {
            let fbrect = resources.scalingGrids(scalingGridIndex);
            this.scalingGrid = new Rectangle(fbrect.left(), fbrect.top(), Math.abs(fbrect.left() - fbrect.right()), Math.abs(fbrect.top() - fbrect.bottom()));
        }
    }

    getTimelineChildren() {
        if (this.timelineChildren == null) {
            this.timelineChildren = [];
            for (let i = 0; i < this.children.length; i++) {
                this.timelineChildren[i] = this.swf.getObject(this.children[i].id, this.exportName);
            }
        }

        return this.timelineChildren;
    }
}