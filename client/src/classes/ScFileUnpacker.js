// import * as Zstd from "@bokuweb/zstd-wasm";
import * as fzstd from "fzstd";
import { InputStream } from "./InputStream";
import { clearBuffer } from "../helpers/clearBuffer";

export class SCWEBDecompresser {
    static SCWEB_MAGIC = 0x5343574542;

    /**
     * @type {InputStream}
     */
    stream;

    /**
     * Validates and decompress a SCWEB file stream.
     * @param {ArrayBuffer} data 
     */
    constructor(data) {
        this.stream = new InputStream(new DataView(data));
        this.checkMagic();
    }

    /**
     * Decompressed the SCWEB file.
     * @param {InputStream} stream 
     */
    decompress() {
        let size = this.getDecompressedSize();

        // providing a buffer with specified length
        // improves decompression performance and
        // reduces unnecessary memory usage

        let output = new Uint8Array(size);
        let compressedData = this.getCompressedData();
        fzstd.decompress(compressedData, output);

        clearBuffer(compressedData);
        this.stream.close();
        this.stream = null;

        return output;
    }

    /**
     * Validates file magic.
     * @returns {string} 
     */
    checkMagic() {
        const magic = this.stream.readLong();

        if (magic != SCWEBDecompresser.SCWEB_MAGIC) {
            throw new Error("Unknown magic: " + magic);
        }
    }

    getDecompressedSize() {
        return this.stream.readInt();
    }

    getCompressedData() {
        return this.stream.readBytes();
    }
}