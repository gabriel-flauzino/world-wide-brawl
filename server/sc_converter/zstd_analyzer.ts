import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync, writeSync } from "fs";
import * as Path from "path";
import { InputStream } from "./InputStream";
import * as Zstd from "@mongodb-js/zstd";
import { FBMatrixBank } from "../../client/src/flatbuffers/supercell-sfw";
import { ByteBuffer as FBByteBuffer } from "flatbuffers";
import { inspect } from "util";
import ByteBuffer from "bytebuffer";

const INPUT_DIR = Path.resolve("sc_converter/input/");
const OUTPUT_DIR = Path.resolve("sc_converter/uncompressed");
const SC_MAGIC = 0x5343;
const ZSTD_MAGIC = 0x28B52FFD;
const ZSTD_ARR = new Uint8Array([0x28, 0xB5, 0x2F, 0xFD]);
const v5 = swapEndian32(5);
const v6 = swapEndian32(6);

main();

async function main() {
    const files = readdirSync(INPUT_DIR);

    for (let file of files) {
        try {
            const filename = file.split(".").slice(0, -1).join(".");
            const data = readFileSync(Path.join(INPUT_DIR, file));
            const stream = new InputStream(new DataView(data.buffer));

            const folder = Path.join(OUTPUT_DIR, filename);

            if (existsSync(folder))
                rmSync(folder, { recursive: true });

            mkdirSync(folder);

            checkMagic(stream);
            let version = checkVersion(stream);

            if (version == v6) {
                stream.skip(2); // 2 weird bytes
            }

            let metadataRootTableOffset = swapEndian32(stream.readInt());

            stream.skip(metadataRootTableOffset);

            let index: number = data.indexOf(ZSTD_ARR, stream.__offset);

            console.log(`----- SC ZSTD DATA INFO: ${filename} -----`);

            do {
                stream.setOffset(index + 4);
                console.log(`\nZSTD found at index ${stream.__offset}`);

                let frameHeaderDescriptor = stream.readUint8();
                let windowDescriptor = 0;
                let dictionaryID = 0;
                let frameContentSize = 0;

                let frameContentSizeFlag = frameHeaderDescriptor >> 6;
                let singleSegmentFlag = frameHeaderDescriptor >> 5 & 1;
                let contentChecksumFlag = frameHeaderDescriptor >> 2 & 1;
                let dictIDFlag = frameHeaderDescriptor & 3;

                let fcsFieldSize = [singleSegmentFlag ? 1 : 0, 2, 4, 8][frameContentSizeFlag];
                let didFieldSize = [0, 1, 2, 4][dictIDFlag];


                if (!singleSegmentFlag) {
                    windowDescriptor = stream.readUint8();
                }

                dictionaryID = bytesToUint32(stream.readBytes(didFieldSize), true);
                frameContentSize = bytesToUint32(stream.readBytes(fcsFieldSize), true);

                const blocks: { header: number, lastBlock: number, blockType: number, blockSize: number }[] = [];
                let finished = false;
                let i = 0;
                while (stream.available() > 0 && !finished) {
                    let bytes = stream.readBytes(3);
                    let blockHeader = bytes[0] | (bytes[1] << 8) | (bytes[2] << 16);
                    let data = {
                        header: blockHeader,
                        lastBlock: (blockHeader) & 0x1,
                        blockType: (blockHeader >> 1) & 0x3,
                        blockSize: (blockHeader >> 3) & 0x1FFFFF
                    }
                    if (data.lastBlock) {
                        finished = true;
                    }
                    if (data.blockType == 1) {
                        stream.skip(1);
                    } else {
                        stream.skip(data.blockSize);
                    }
                    i++;
                    blocks.push(data);
                }

                if (contentChecksumFlag) {
                    stream.skip(4);
                }

                console.log(`\nFrame_Header:`)
                console.log(`- Frame_Header_Descriptor: ${frameHeaderDescriptor}`);
                console.log(`| - Frame_Content_Size_flag: ${frameContentSizeFlag}`);
                console.log(`| | Single_Segment_flag: ${singleSegmentFlag}`);
                console.log(`| | Content_Checksum_flag: ${contentChecksumFlag}`);
                console.log(`| - Dictionary_ID_flag: ${dictIDFlag}`);
                console.log(`| Window_Descriptor: ${windowDescriptor}`);
                console.log(`| Dictionary_ID: ${dictionaryID}`);
                console.log(`| Frame_Content_Size: ${frameContentSize}`);
                console.log(`| Data_Blocks: ${blocks.length}`);
                console.log(`| Data_Blocks_Total_Length: ${blocks.reduce((a, b) => a + b.blockSize + 3, 0)}`)
                console.log(`| Stream_Offset: ${stream.__offset}`);
                console.log(`- Stream_Available: ${stream.available()}`);

                let zstdLength = stream.__offset - index;

                let decompressed = await Zstd.decompress(Buffer.from(new Uint8Array(stream.dataView.buffer, stream.__offset - zstdLength, zstdLength)));

                writeFileSync(Path.join(folder, `${filename}_${index}.bin`), decompressed);
                try {
                    const bb = ByteBuffer.wrap(decompressed);
                    bb.order(ByteBuffer.LITTLE_ENDIAN);
                    let chunk = getChunkBytes(bb);
                    let fb = FBMatrixBank.getRootAsFBMatrixBank(chunk.data);
                    console.log(fb.matricesLength(), fb.shortMatricesLength());
                } catch (e) {
                    console.log("Could not deserialize data")
                }

                console.log(`\n\n`);
            } while ((index = data.indexOf(ZSTD_ARR, stream.__offset)) != -1 /* false */);
        } catch (e) {
            console.error(file, e);
        }
    }
    console.log("\nTask done successfully.\n");
}

function checkMagic(stream: InputStream) {
    const magic = stream.readShort();

    if (magic != SC_MAGIC)
        throw new Error("File is not SC. Magic: " + magic);
}

function checkVersion(stream: InputStream) {
    let version = stream.readInt();

    if (version == 4) {
        version = swapEndian32(4);
    }

    if (![v5, v6].includes(version))
        throw new Error("SC version is not supported. File version: " + swapEndian32(version));

    return version;
}

function swapEndian32(number: number) {
    return (number >> 24) & 0xFF | (((number >> 16) & 0xFF) << 8) | (((number >> 8) & 0xFF) << 16) | ((number & 0xFF) << 24);
}

function bytesToUint32(arr: Uint8Array, littleEndian = false) {
    const padded = new Uint8Array(4);
    padded.set(arr, 4 - arr.length);
    return new DataView(padded.buffer).getUint32(0, littleEndian);
}

function getChunkBytes(byteBuffer: ByteBuffer) {
    let length = byteBuffer.readInt32();
    let bytes = byteBuffer.readBytes(length).toBuffer();
    return {
        length,
        data: new FBByteBuffer(new Uint8Array(bytes))
    };
}