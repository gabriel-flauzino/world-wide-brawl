export class InputStream {
    dataView;
    __offset = 0;

    /**
     * 
     * @param {DataView} dataView 
     */
    constructor(dataView) {
        this.dataView = dataView;
    }

    skip(bytes) {
        this.__offset += bytes;
    }

    available() {
        return this.dataView.byteLength - this.__offset; 
    }

    readShort() {
        const short = this.dataView.getUint16(this.__offset, false);
        this.__offset += 2;
        return short;
    }

    readInt() {
        const int = this.dataView.getUint32(this.__offset, false);
        this.__offset += 4;
        return int;
    }

    readLong() {
        const long = this.dataView.getBigUint64(this.__offset, false);
        this.__offset += 8;
        return long;
    }
    
    setOffset(n) {
        this.__offset = n;
    }

    close() {
        this.dataView = null;
        this.__offset = null;
    }
}