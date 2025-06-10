import * as Zstd from "@bokuweb/zstd-wasm"
import { InputStream } from "./InputStream";

export class ScFileUnpacker {
    static SC_MAGIC = 0x5343;
    static SCWEB_MAGIC = 0x5343574542;
    static FIVE_LITTLE_ENDIAN = this.swapEndian32(5);
    static START_SECTION_BYTES = new TextEncoder().encode("START");

    static unpack(data) {
        let compressedData = new Uint8Array(data);
        let stream = new InputStream(new DataView(data));

        let type = this.checkMagic(stream);
        this.checkVersion(stream);

        if (type == "SC") {
            let metadataRootTableOffset = this.swapEndian32(stream.readInt());
            this.skipBytes(stream, metadataRootTableOffset);

            metadataRootTableOffset = null;
        }

        let decompressed = this.decompress(compressedData, stream);

        stream.close();
        
        compressedData = null;
        stream = null;
        type = null;

        return { decompressed };
    }

    /**
         * 
         * @param {Uint8Array} compressedData 
         * @param {InputStream} stream 
         */
    static decompress(compressedData, stream) {
        let decompressed;

        const offset = compressedData.byteLength - stream.available();
        const startSectionOffset = this.indexOf(compressedData, this.START_SECTION_BYTES);

        if (startSectionOffset != -1) {
            decompressed = Zstd.decompress(compressedData.subarray(offset, startSectionOffset - offset));
        } else {
            decompressed = Zstd.decompress(compressedData.subarray(offset));
        }

        return decompressed;
    }

    static checkMagic(stream) {
        const magic = stream.readLong();

        if (magic == this.SCWEB_MAGIC) {
            return "SCWEB";
        } else {
            stream.setOffset(0);
            const magic = stream.readShort();

            if (magic != this.SC_MAGIC)
                throw new Error("Unknown file magic: " + magic);
            
            return "SC";
        }
    }

    static checkVersion(stream) {
        let version = stream.readInt();

        if (version == 4) {
            version = stream.readInt();
        }

        if (version == this.FIVE_LITTLE_ENDIAN) {
            version = 5;
        }

        if (version != 5)
            throw new Error("Only version 5 files can be read. File version: " + version);

        return version;
    }

    static skipBytes(stream, bytes) {
        stream.skip(bytes);
    }

    static swapEndian32(number) {
        return (number >> 24) & 0xFF | (((number >> 16) & 0xFF) << 8) | (((number >> 8) & 0xFF) << 16) | ((number & 0xFF) << 24);
    }

    static indexOf(array, bytesToFind) {
        for (let i = 0; i < array.length; i++) {
            let found = true;
            for (let j = 0; j < bytesToFind.length; j++) {
                if (array[i + j] != bytesToFind[j]) {
                    found = false;
                    break;
                }
            }

            if (found) {
                return i;
            }
        }

        return -1;
    }
}