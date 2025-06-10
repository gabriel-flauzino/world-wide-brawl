import { Game } from "./Game";

export class KTXLoader {
    /**
     * @type { HTMLCanvasElement }
     */
    static canvas;
    /**
     * @type { WebGL2RenderingContext }
     */
    static gl;
    static ktx;
    static initialized;

    /**
     * 
     * @param {Game} game 
     */
    static async init(game) {
        if (this.initialized)
            return;

        this.initialized = true;
        this.canvas = document.createElement("canvas");
        // this.ctx = this.canvas.getContext("2d");
        window.gl = this.gl = this.canvas.getContext("webgl2");

        document.body.appendChild(this.canvas);

        this.ktx = await createKtxModule({ preinitializedWebGLContext: this.gl });
        this.ktx.GL.makeContextCurrent(
            this.ktx.GL.createContext(this.canvas, { majorVersion: 2.0 })
        );

        // unused
        // KTXLoader.canvas = document.createElement("canvas");
        // KTXLoader.gl = canvas.getContext("webgl2");
    }

    /**
     * @param {Game} game
     * @param {Uint8Array} ktxData 
     */
    static async loadTexture(game, ktxData) {
        if (!this.initialized)
            await this.init(game);

        console.log(ktxData)

        const identifier = ktxData.subarray(0, 12);
        const magic = String.fromCharCode(...identifier);
        console.log(magic)
        if (magic.includes('KTX 11')) {
            const url = URL.createObjectURL(new Blob([ktxData], { type: 'application/octet-stream' }));
            if (confirm("Want to download the .ktx file?"))
                window.open(url);
        }

        // const placeholder = this.createPlaceholderTexture([0, 0, 255, 255]);
        // this.gl.bindTexture(placeholder.target, placeholder.object);
        const texture = new this.ktx.texture(ktxData);
        // const image = texture.getImage(0, 0, 0);
        // console.log(image);
        // this.canvas.width = texture.baseWidth;
        // this.canvas.height = texture.baseHeight;
        // const imageData = this.ctx.createImageData(texture.baseWidth, texture.baseHeight);
        // for (let i = 0; i < imageData.length; i++) {
        //     imageData.data[i] = image[i];
        // }
        // this.ctx.putImageData(imageData, 0, 0);
        const uploaded = this.uploadTextureToGl(texture);
        console.log(uploaded)
    }

    static createPlaceholderTexture(color) {
        const placeholder = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, placeholder);

        const level = 0;
        const internalFormat = this.gl.RGBA;
        const width = 1;
        const height = 1;
        const border = 0;
        const srcFormat = this.gl.RGBA;
        const srcType = this.gl.UNSIGNED_BYTE;
        const pixel = new Uint8Array(color);

        this.gl.texImage2D(this.gl.TEXTURE_2D, level, internalFormat,
            width, height, border, srcFormat, srcType,
            pixel);
        return {
            target: this.gl.TEXTURE_2D,
            object: placeholder,
            format: undefined,
        };
    }

    static uploadTextureToGl(texture) {
        console.log(texture)
        const { transcode_fmt } = this.ktx;
        let formatString;

        window.astc = this.gl.getExtension('WEBGL_compressed_texture_astc');
        window.dxt = this.gl.getExtension('WEBGL_compressed_texture_s3tc');
        window.pvrtc = this.gl.getExtension('WEBGL_compressed_texture_pvrtc') || this.gl.getExtension('WEBKIT_WEBGL_compressed_texture_pvrtc');
        window.etc = this.gl.getExtension('WEBGL_compressed_texture_etc');

        if (texture.needsTranscoding) {
            let format;
            if (astc) {
                formatString = 'ASTC';
                format = transcode_fmt.ASTC_4x4_RGBA;
            } else if (dxt) {
                formatString = texture.numComponents == 4 ? 'BC3' : 'BC1';
                format = transcode_fmt.BC1_OR_3;
            } else if (pvrtc) {
                formatString = 'PVRTC1';
                format = transcode_fmt.PVRTC1_4_RGBA;
            } else if (etc) {
                formatString = 'ETC';
                format = transcode_fmt.ETC;
            } else {
                formatString = 'RGBA4444';
                format = transcode_fmt.RGBA4444;
            }
            if (texture.transcodeBasis(format, 0) != this.ktx.error_code.SUCCESS) {
                return undefined;
            }
        }

        console.log(formatString, texture.needsTranscoding);

        const result = texture.glUpload();
        if (result.error != this.gl.NO_ERROR) {
            // alert('WebGL error when uploading texture, code = '
            //     + result.error.toString(16));
            return undefined;
        }
        if (result.object === undefined) {
            // alert('Texture upload failed. See console for details.');
            return undefined;
        }
        if (result.target != this.gl.TEXTURE_2D) {
            // alert('Loaded texture is not a TEXTURE2D.');
            return undefined;
        }

        return {
            target: result.target,
            object: result.object,
            format: formatString,
        }
    }

    static setTexParameters(texture, ktexture) {
        gl.bindTexture(texture.target, texture.object);

        if (ktexture.numLevels > 1 || ktexture.generateMipmaps) {
            // Enable bilinear mipmapping.
            gl.texParameteri(texture.target,
                gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        } else {
            gl.texParameteri(texture.target, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
        gl.texParameteri(texture.target, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        gl.bindTexture(texture.target, null);
    }
}