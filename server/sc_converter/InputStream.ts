export class InputStream {
    dataView: DataView;
    __offset = 0;

    /**
     * Represents a input stream for reading data from a DataView.
     * @param {DataView} dataView 
     */
    constructor(dataView: DataView) {
        this.dataView = dataView;
    }

    /**
     * Skip a number of bytes in the stream.
     * @param {number} bytes 
     */
    skip(bytes: number) {
        this.moveOffsetBy(bytes);
    }

    /**
     * Returns the number of bytes left in the stream.
     * @returns {number}
     */
    available(): number {
        return this.dataView.byteLength - this.__offset;
    }

    readUint8(): number {
        const int8 = this.dataView.getUint8(this.__offset);
        this.moveOffsetBy(1);
        return int8;
    };

    /**
     * Reads a Uint16 from the stream.
     * @returns {number}
     */
    readShort(): number {
        const short = this.dataView.getUint16(this.__offset, false);
        this.moveOffsetBy(2);
        return short;
    }

    /**
     * Reads a Uint32 from the stream.
     * @returns {number}
     */
    readInt(): number {
        const int = this.dataView.getUint32(this.__offset, false);
        this.moveOffsetBy(4);
        return int;
    }

    /**
     * Reads a BigUint64 from the stream.
     * @returns {bigint}
     */
    readLong(): bigint {
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
    readBytes(length?: number): Uint8Array {
        const bytes = new Uint8Array(this.dataView.buffer, this.__offset, length);
        this.moveOffsetBy(bytes.length);
        return bytes;
    }

    setOffset(n: number) {
        this.__offset = n;
    }
    
    moveOffsetBy(n: number) {
        this.__offset += n;
    }
}