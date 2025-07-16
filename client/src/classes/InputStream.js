import { clearBuffer } from "../helpers/clearBuffer";

export class InputStream {
    dataView;
    __offset = 0;

    /**
     * Represents a input stream for reading data from a DataView.
     * @param {DataView} dataView 
     */
    constructor(dataView) {
        this.dataView = dataView;
    }

    /**
     * Skip a number of bytes in the stream.
     * @param {number} bytes 
     */
    skip(bytes) {
        this.moveOffsetBy(bytes);
    }

    /**
     * Returns the number of bytes left in the stream.
     * @returns {number}
     */
    available() {
        return this.dataView.byteLength - this.__offset;
    }

    /**
     * Reads a Uint16 from the stream.
     * @returns {number}
     */
    readShort() {
        const short = this.dataView.getUint16(this.__offset, false);
        this.moveOffsetBy(2);
        return short;
    }

    /**
     * Reads a Uint32 from the stream.
     * @returns {number}
     */
    readInt() {
        const int = this.dataView.getUint32(this.__offset, false);
        this.moveOffsetBy(4);
        return int;
    }

    /**
     * Reads a BigUint64 from the stream.
     * @returns {bigint}
     */
    readLong() {
        const long = this.dataView.getBigUint64(this.__offset, false);
        this.moveOffsetBy(8);
        return long;
    }

    /**
     * Reads a specified number of bytes from the stream.
     * If no length is provided, returns all the bytes left in the stream.
     * @param {number} length 
     * @returns {Uint8Array}
     */
    readBytes(length) {
        const bytes = new Uint8Array(this.dataView.buffer, this.__offset, length);
        this.moveOffsetBy(bytes.length);
        return bytes;
    }

    setOffset(n) {
        this.__offset = n;
    }
    
    moveOffsetBy(n) {
        this.__offset += n;
    }

    /**
     * Tells the gods of GC to clear the used memory (only works if they are in good mood)
     */
    close() {
        clearBuffer(this.dataView.buffer);
        this.dataView = null;
    }
}