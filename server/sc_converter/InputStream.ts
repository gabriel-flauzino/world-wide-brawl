export class InputStream extends DataView {
    __offset = 0;

    constructor(buffer: ArrayBuffer) {
        super(buffer);
    }

    skip(bytes: number) {
        this.__offset += bytes;
    }

    available() {
        return this.byteLength - this.__offset; 
    }

    readShort() {
        const short = this.getUint16(this.__offset, false);
        this.__offset += 2;
        return short;
    }

    readInt() {
        const int = this.getUint32(this.__offset, false);
        this.__offset += 4;
        return int;
    }
}