import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import * as Path from "path";
// import * as Zstd from "@bokuweb/zstd-wasm";
import { InputStream } from "./InputStream";
import ByteBuffer from "bytebuffer";
import { FBTexture, FBTextureSet, FBTextureSets } from "../../client/src/flatbuffers/supercell-sfw";
import { ByteBuffer as FBByteBuffer, Builder as FBBuilder } from "flatbuffers";
import { execSync } from "child_process";
import { Presets, SingleBar } from "cli-progress";
import * as Zstd from "@mongodb-js/zstd";

const INPUT_DIR = Path.resolve("sc_converter/input/");
const OUTPUT_DIR = Path.resolve("../client/src/assets");
// const OUTPUT_DIR = Path.resolve("sc_converter/output"); // debug
const SC_MAGIC = 0x5343;
const SCWEB_MAGIC = 0x5343574542;
const ZSTD_MAGIC = 0x28B52FFD;
const v5 = swapEndian32(5);
const v6 = swapEndian32(6);

main();

async function main() {
    const textEncoder = new TextEncoder();
    const builder = new FBBuilder(1024);
    const files = readdirSync(INPUT_DIR);
    const tempdir = Path.join(OUTPUT_DIR, "__temp")
    const bindir = Path.join(OUTPUT_DIR, "scweb")

    if (existsSync(bindir))
        rmSync(bindir, { recursive: true });

    mkdirSync(tempdir, { recursive: true });
    mkdirSync(bindir, { recursive: true });

    let progressbar = new SingleBar({}, Presets.shades_classic);

    progressbar.start(files.length, 0);

    for (let file of files) {
        try {
            const filename = file.split(".").slice(0, -1).join(".");
            const data = readFileSync(Path.join(INPUT_DIR, file));
            const stream = new InputStream(new DataView(data.buffer));

            checkMagic(stream);
            let version = checkVersion(stream);

            if (version == v6) {
                stream.skip(2); // 2 weird bytes
            }

            let metadataRootTableOffset = swapEndian32(stream.readInt());

            stream.skip(metadataRootTableOffset);

            let zstdDataLength = calculateZstdFileLength(stream);
            let compressed = stream.readBytes(zstdDataLength);

            const decompressed = await decompress(compressed);

            const byteBuffer = ByteBuffer.wrap(decompressed);
            byteBuffer.LE();

            const resourcesChunk = getChunkBytes(byteBuffer);
            const exportsChunk = getChunkBytes(byteBuffer);
            const textFieldsChunk = getChunkBytes(byteBuffer);
            const shapesChunk = getChunkBytes(byteBuffer);
            const movieClipsChunk = getChunkBytes(byteBuffer);
            const modifiersChunk = getChunkBytes(byteBuffer);
            const texturesChunk = getChunkBytes(byteBuffer);

            const pathsc = Path.join(bindir, filename);
            mkdirSync(pathsc);

            const textures = deserializeTextures(texturesChunk.data, false);
            const ktx2textures: number[] = [];

            for (let [i, texture] of Object.entries(textures)) {
                if (texture.dataLength()) {
                    const ktxData = new Uint8Array(texture.dataLength());

                    for (let i = 0; i < texture.dataLength(); i++) {
                        ktxData[i] = texture.data(i)!;
                    }

                    const ktx1path = Path.join(tempdir, `${filename}_${i}.ktx1`);
                    const ktx2path = Path.join(tempdir, `${filename}_${i}.ktx2`);
                    const pngpath = Path.join(pathsc, `${filename}_${i}.tex.png`);

                    writeFileSync(ktx1path, ktxData);

                    execSync(`ktx2ktx2 ${ktx1path}`);
                    execSync(`ktx extract ${ktx2path} ${pngpath}`)

                    // const pngdata = new Uint8Array(readFileSync(pngpath).buffer);
                    const pngdata = textEncoder.encode(pngpath.replace(OUTPUT_DIR, ""));

                    const dataOffset = FBTexture.createDataVector(builder, pngdata);

                    FBTexture.startFBTexture(builder);
                    FBTexture.addFlags(builder, texture.flags());
                    FBTexture.addType(builder, texture.type());
                    FBTexture.addWidth(builder, texture.width());
                    FBTexture.addHeight(builder, texture.height());
                    FBTexture.addData(builder, dataOffset);
                    FBTexture.addTextureFileRefId(builder, texture.textureFileRefId());
                    let newTexture = FBTexture.endFBTexture(builder);

                    FBTextureSet.startFBTextureSet(builder);
                    FBTextureSet.addHighresTexture(builder, newTexture);
                    ktx2textures.push(FBTextureSet.endFBTextureSet(builder));
                } else {
                    throw new Error("File is not up to date");
                }
            }

            const setsOffset = FBTextureSets.createTextureSetsVector(builder, ktx2textures);

            FBTextureSets.startFBTextureSets(builder);
            FBTextureSets.addTextureSets(builder, setsOffset);
            let fbTextureSets = FBTextureSets.endFBTextureSets(builder);
            builder.finish(fbTextureSets);
            const bytes = builder.asUint8Array();

            const intsLength = 4 * 6;

            const byteBufferLength =
                resourcesChunk.length +
                exportsChunk.length +
                textFieldsChunk.length +
                shapesChunk.length +
                movieClipsChunk.length +
                modifiersChunk.length +
                bytes.length +
                intsLength;

            const newData = new ByteBuffer(byteBufferLength, true);

            newData.writeInt32(resourcesChunk.length);
            newData.append(resourcesChunk.data.bytes());
            newData.writeInt32(exportsChunk.length);
            newData.append(exportsChunk.data.bytes());
            newData.writeInt32(textFieldsChunk.length);
            newData.append(textFieldsChunk.data.bytes());
            newData.writeInt32(shapesChunk.length);
            newData.append(shapesChunk.data.bytes());
            newData.writeInt32(movieClipsChunk.length);
            newData.append(movieClipsChunk.data.bytes());
            newData.writeInt32(modifiersChunk.length);
            newData.append(modifiersChunk.data.bytes());
            newData.writeInt32(bytes.length);
            newData.append(bytes);

            let dat = new Uint8Array(newData.buffer);

            let newCompressed = await Zstd.compress(Buffer.from(dat));

            let finalData = new ByteBuffer(newCompressed.length + 12);

            finalData.writeInt64(SCWEB_MAGIC);
            finalData.writeInt32(dat.length);
            finalData.append(newCompressed);

            writeFileSync(Path.join(pathsc, `${filename}.scweb`), new Uint8Array(finalData.buffer));
        } catch (e) {
            console.error(file, e);
        }

        progressbar.increment();
    }

    rmSync(tempdir, { recursive: true });
    progressbar.stop();
    console.log("\nTask done successfully.\n");
}

function checkMagic(stream: InputStream) {
    const magic = stream.readShort();

    if (magic != SC_MAGIC)
        throw new Error("Unknown file magic: " + magic);
}

function checkVersion(stream: InputStream) {
    let version = stream.readInt();

    if (![v5, v6].includes(version))
        throw new Error("Only version 5 files can be read. File version: " + swapEndian32(version));

    return version;
}

function swapEndian32(number: number) {
    return (number >> 24) & 0xFF | (((number >> 16) & 0xFF) << 8) | (((number >> 8) & 0xFF) << 16) | ((number & 0xFF) << 24);
}

function decompress(compressed: Uint8Array) {
    return Zstd.decompress(Buffer.from(compressed));

    /* const offset = compressed.byteLength - stream.available();
    const startSectionOffset = indexOf(compressed, START_SECTION_BYTES);

    if (startSectionOffset != -1) {
        decompressed = Zstd.decompress(compressed.subarray(offset, startSectionOffset - offset));
    } else {
        decompressed = Zstd.decompress(compressed.subarray(offset));
    } */
}

function getChunkBytes(byteBuffer: ByteBuffer) {
    let length = byteBuffer.readInt32();
    let bytes = byteBuffer.readBytes(length).toBuffer();
    return {
        length,
        data: new FBByteBuffer(new Uint8Array(bytes))
    };
}

function deserializeTextures(chunkBuffer: FBByteBuffer, preferLowres: boolean) {
    let fbTextureSets = FBTextureSets.getRootAsFBTextureSets(chunkBuffer);

    let textures = new Array<FBTexture>(fbTextureSets.textureSetsLength());
    for (let i = 0; i < fbTextureSets.textureSetsLength(); i++) {
        try {
            let fbTextureSet = fbTextureSets.textureSets(i);

            if (fbTextureSet != null) {
                let fbHighresTexture = fbTextureSet.highresTexture();
                let fbLowresTexture = fbTextureSet.lowresTexture();

                let fbTexture: FBTexture;

                if ((fbHighresTexture == null || preferLowres) && fbLowresTexture != null) {
                    fbTexture = fbLowresTexture;
                } else if (fbHighresTexture != null) {
                    fbTexture = fbHighresTexture;
                } else
                    throw new Error();

                textures[i] = fbTexture;
            } else
                throw new Error();
        } catch (e) {
            throw new Error("FBTextureSet doesn't contain any textures.");
        }

    }

    return textures;
}

function calculateZstdFileLength(stream: InputStream): number {
    let offsetBefore = stream.__offset;

    let magic = stream.readInt();

    if (magic == ZSTD_MAGIC) {
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

        let finished = false;
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
        }

        if (contentChecksumFlag) {
            stream.skip(4);
        }

        let offsetAfter = stream.__offset;
        let length = offsetAfter - offsetBefore;

        stream.setOffset(offsetBefore);

        return length;
    } else {
        throw new Error("SC data is not ZSTD compressed.");
    }
}

function bytesToUint32(arr: Uint8Array, littleEndian = false) {
    const padded = new Uint8Array(4);
    padded.set(arr, 4 - arr.length);
    return new DataView(padded.buffer).getUint32(0, littleEndian);
}