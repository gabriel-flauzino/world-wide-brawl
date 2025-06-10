export class MovieClipFrameElement {
    constructor(frameElement) {
        this.childIndex = frameElement.childIndex();
        this.matrixIndex = frameElement.matrixIndex();
        this.colorTransformIndex = frameElement.colorTransformIndex();
    }
}