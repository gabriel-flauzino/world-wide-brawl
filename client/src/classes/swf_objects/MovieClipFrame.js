import { MovieClipFrameElement } from "./MovieClipFrameElement";

export class MovieClipFrame {
    constructor(fb, resources, offset) {
      if (fb.labelRefId && typeof fb.labelRefId === 'function') {
        this.label = fb.labelRefId() !== 0 ? resources.strings(fb.labelRefId()) : null;
      } else {
        this.label = null;
      }
  
      this.elements = [];
      for (let i = 0; i < fb.frameElementCount(); i++) {
        this.elements.push(new MovieClipFrameElement(resources.movieClipFrameElements(offset + i)));
      }
    }
  
    getElementCount() {
      return this.elements.length;
    }
  }