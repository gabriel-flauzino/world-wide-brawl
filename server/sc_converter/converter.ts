import { existsSync, mkdirSync, readdirSync, readFileSync, rmdirSync, rmSync, writeFileSync } from "fs";
import * as Path from "path";
import * as Zstd from "@bokuweb/zstd-wasm";
import { InputStream } from "./InputStream";
import ByteBuffer from "bytebuffer";
import { FBTexture, FBTextureSet, FBTextureSets } from "../../client/src/flatbuffers/supercell-sfw";
import { ByteBuffer as FBByteBuffer, Builder as FBBuilder } from "flatbuffers";
import { exec, execSync } from "child_process";
import { Presets, SingleBar } from "cli-progress";
import { read } from "ktx-parse";
import {} from "texture-compressor";
import {} from "sharp";

const INPUT_DIR = Path.resolve("sc_converter/input/");
const OUTPUT_DIR = Path.resolve("../client/src/assets");
// const OUTPUT_DIR = Path.resolve("sc_converter/output");
const SC_MAGIC = 0x5343;
const SCWEB_MAGIC = 0x5343574542;
const FIVE_LITTLE_ENDIAN = swapEndian32(5);
const START_SECTION_BYTES = new TextEncoder().encode("START");

main();

async function main() {
    await Zstd.init();
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
            const compressed = new Uint8Array(data);
            const stream = new InputStream(data.buffer);
        
            checkMagic(stream);
            checkVersion(stream);

            const metadataRootTableOffset = swapEndian32(stream.readInt());

            stream.skip(metadataRootTableOffset);

            const decompressed = decompress(compressed, stream);

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

            let newCompressed = Zstd.compress(dat);

            let finalData = new ByteBuffer(newCompressed.length + 8 + 4);

            finalData.writeInt64(SCWEB_MAGIC);
            finalData.writeInt32(FIVE_LITTLE_ENDIAN);
            finalData.append(newCompressed);
            
            writeFileSync(Path.join(pathsc, `${filename}.scweb`), new Uint8Array(finalData.buffer));
        } catch (e) {
            console.error(`${file}: ${e.message}`);
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

    if (version == 4) {
        version = stream.readInt();
    }

    if (version == FIVE_LITTLE_ENDIAN) {
        version = 5;
    }

    if (version != 5)
        throw new Error("Only version 5 files can be read. File version: " + version);

    return version;
}

function swapEndian32(number: number) {
    return (number >> 24) & 0xFF | (((number >> 16) & 0xFF) << 8) | (((number >> 8) & 0xFF) << 16) | ((number & 0xFF) << 24);
}

function decompress(compressed: Uint8Array, stream: InputStream) {
    let decompressed: Uint8Array;

    const offset = compressed.byteLength - stream.available();
    const startSectionOffset = indexOf(compressed, START_SECTION_BYTES);

    if (startSectionOffset != -1) {
        decompressed = Zstd.decompress(compressed.subarray(offset, startSectionOffset - offset));
    } else {
        decompressed = Zstd.decompress(compressed.subarray(offset));
    }

    return decompressed;
}

function indexOf(array: Uint8Array, bytesToFind: Uint8Array) {
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
