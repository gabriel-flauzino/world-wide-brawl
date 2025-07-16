import { Container, Geometry, Mesh, Rectangle, Shader } from "pixi.js";
import { ColorTransform } from "../../classes/swf_objects/ColorTransform";
import { Matrix2x3 } from "../../classes/swf_objects/Matrix2x3";
import { Shape } from "../../classes/swf_objects/Shape";

export class ShapeComponent extends Container {
    shape;
    matrix2x3;
    renderized = false;

    /**
     * 
     * @param {Shape} shape 
     */
    constructor(shape) {
        super();
        this.shape = shape;
        this.objectId = shape.id;
    }

    async render(colorTransform = new ColorTransform(), matrix2x3 = new Matrix2x3(), scalingGrid, name, blend) {
        this.label = name;

        if (!this.renderized) {
            let matrix = Matrix2x3.fromMatrix(matrix2x3);

            if (scalingGrid && this.shape.commands.length > 1) {
                matrix.a = matrix.d = 1;
            }

            for (let command of this.shape.commands) {
                const { texture } = this.shape.swf.textures.get(command.textureIndex);

                const vertices = [];
                const uvs = [];
                const indices = [];

                command.shapePoints.forEach((point, i) => {
                    vertices.push(point.x, point.y);
                    uvs.push(point.u / 65535, point.v / 65535);

                    if (i >= 2) {
                        indices.push(i - 2, i - 1, i);
                    }
                });

                // Criar a mesh com a textura
                const geometry = new Geometry({
                    attributes: {
                        aPosition: vertices,
                        aUV: uvs
                    },
                    indexBuffer: indices
                });

                const shader = Shader.from({
                    gl: {
                        vertex: `
            attribute vec2 aPosition;
            attribute vec2 aUV;
            
            out vec2 vUV;
            
            uniform mat3 uProjectionMatrix;
            uniform mat3 uWorldTransformMatrix;
            
            uniform mat3 uTransformMatrix;

            uniform mat3 uTransform;
            
            
            void main() {
                vec3 pos = uTransform * vec3(aPosition, 1.0);
                mat3 mvp = uProjectionMatrix * uWorldTransformMatrix * uTransformMatrix;
                gl_Position = vec4((mvp * vec3(pos.xy, 1.0)).xy, 0.0, 1.0);
            
                vUV = aUV;
            }
        `,
                        fragment: `            
            uniform sampler2D uTexture;
                        
            in vec2 vUV;
            
            /* uniform float uRedMultiplier;
            uniform float uGreenMultiplier;
            uniform float uBlueMultiplier;
            uniform float uRedAddition;
            uniform float uGreenAddition;
            uniform float uBlueAddition;
            uniform float uAlpha; */

            uniform vec4 uColorMul;
            uniform vec3 uColorAdd;
            
            void main() {
                vec4 texColor = texture2D(uTexture, vUV);
                
                /* float a = texColor.a * uAlpha;
                float r = (texColor.r * uRedMultiplier + uRedAddition) * a;
                float g = (texColor.g * uGreenMultiplier + uGreenAddition) * a;
                float b = (texColor.b * uBlueMultiplier + uBlueAddition) * a;
                gl_FragColor =  vec4(r, g, b, a); */

                vec4 color = texColor * uColorMul;
                color.rgb += uColorAdd * color.a;
                gl_FragColor = vec4(color.rgb * uColorMul.a, color.a); 
            }
        `
                    },
                    resources: {
                        uTexture: texture.source,
                        uniforms: {
                            uColorMul: { type: "vec4<f32>", value: [colorTransform.redMultiplier / 255, colorTransform.greenMultiplier / 255, colorTransform.blueMultiplier / 255, colorTransform.alpha / 255] },
                            uColorAdd: { type: "vec3<f32>", value: [colorTransform.redAddition / 255, colorTransform.greenAddition / 255, colorTransform.blueAddition / 255] },
                            uTransform: { type: "mat3x3<f32>", value: matrix.toArray(true) }
                        }
                    },
                });

                const mesh = new Mesh({ geometry, shader });

                mesh.cullable = true;
                mesh.defaultWidth = mesh.width;
                mesh.defaultHeight = mesh.height;

                this.addChild(mesh);
            }

            this.originalWidth = this.width;
            this.originalHeight = this.height;

            this.renderized = true;
        }

        this.applyMatrixAndColor(colorTransform, matrix2x3, scalingGrid, name, blend);

        return this;
    }

    /**
     * 
     * @param {ColorTransform} colorTransform 
     * @param {Matrix2x3} matrix2x3 
     * @param {Rectangle} scalingGrid 
     * @param {number} blend 
     */
    applyMatrixAndColor(colorTransform = new ColorTransform(), matrix2x3 = new Matrix2x3(), scalingGrid, name, blend) {
        let scaleX = matrix2x3.a;
        let scaleY = matrix2x3.d;
        let x = matrix2x3.tx;
        let y = matrix2x3.ty;

        if (scalingGrid && this.shape.commands.length > 1) {
            matrix2x3.a = matrix2x3.d = 1;
            matrix2x3.tx = matrix2x3.ty = 0;
        }

        let updateMatrix = !this.matrix2x3 || !matrix2x3.equals(this.matrix2x3);
        let updateColorTransform = !this.colorTransform || !colorTransform.equals(this.colorTransform);

        if (updateMatrix || updateColorTransform) {
            for (let mesh of this.children) {
                let u = mesh.shader.resources.uniforms.uniforms;

                if (updateColorTransform) {
                    u.uColorMul[0] = colorTransform.redMultiplier / 255;
                    u.uColorMul[1] = colorTransform.greenMultiplier / 255;
                    u.uColorMul[2] = colorTransform.blueMultiplier / 255;
                    u.uColorMul[3] = colorTransform.alpha / 255;

                    u.uColorAdd[0] = colorTransform.redAddition / 255;
                    u.uColorAdd[1] = colorTransform.greenAddition / 255;
                    u.uColorAdd[2] = colorTransform.blueAddition / 255;
                }

                if (updateMatrix) {
                    u.uTransform[0] = matrix2x3.a;
                    u.uTransform[1] = matrix2x3.b;
                    u.uTransform[3] = matrix2x3.c;
                    u.uTransform[4] = matrix2x3.d;
                    u.uTransform[6] = matrix2x3.tx;
                    u.uTransform[7] = matrix2x3.ty;
                }

                // matrix2x3.decompose(mesh);
            }
        }

        matrix2x3.a = scaleX;
        matrix2x3.d = scaleY;
        matrix2x3.tx = x;
        matrix2x3.ty = y;

        if (scalingGrid) {
            const scaledWidth = this.originalWidth * matrix2x3.a;
            const scaledHeight = this.originalHeight * matrix2x3.d;

            if (this.shape.commands.length == 3) {
                // 3-slice shape

                const L = this.children[0];
                const C = this.children[1];
                const R = this.children[2];

                // X-scaling

                L.x = matrix2x3.tx + L.bounds.minX * (matrix2x3.a - 1);
                R.x = matrix2x3.tx + R.bounds.maxX * (matrix2x3.a - 1);

                C.scale.x = (scaledWidth - L.defaultWidth - R.defaultWidth) / C.defaultWidth;
                C.x = (matrix2x3.tx - C.bounds.minX * (C.scale.x - 1)) + L.bounds.minX * (matrix2x3.a - 1);

                // Y-scaling

                L.y = matrix2x3.ty;
                C.y = matrix2x3.ty;
                R.y = matrix2x3.ty;

                L.scale.y = matrix2x3.d;
                C.scale.y = matrix2x3.d;
                R.scale.y = matrix2x3.d;
            }

            if (this.shape.commands.length == 9) {
                // 9-slice shape

                const TL = this.children[0];
                const T = this.children[1];
                const TR = this.children[2];
                const L = this.children[3];
                const C = this.children[4];
                const R = this.children[5];
                const BL = this.children[6];
                const B = this.children[7];
                const BR = this.children[8];

                // X-scaling

                TL.x = matrix2x3.tx + TL.bounds.minX * (matrix2x3.a - 1);
                L.x = matrix2x3.tx + L.bounds.minX * (matrix2x3.a - 1);
                BL.x = matrix2x3.tx + BL.bounds.minX * (matrix2x3.a - 1);

                TR.x = matrix2x3.tx + TR.bounds.maxX * (matrix2x3.a - 1);
                R.x = matrix2x3.tx + R.bounds.maxX * (matrix2x3.a - 1);
                BR.x = matrix2x3.tx + BR.bounds.maxX * (matrix2x3.a - 1);

                T.scale.x = (scaledWidth - L.defaultWidth - R.defaultWidth) / T.defaultWidth;
                T.x = (matrix2x3.tx - T.bounds.minX * (T.scale.x - 1)) + L.bounds.minX * (matrix2x3.a - 1);
                C.scale.x = (scaledWidth - L.defaultWidth - R.defaultWidth) / C.defaultWidth;
                C.x = (matrix2x3.tx - C.bounds.minX * (C.scale.x - 1)) + L.bounds.minX * (matrix2x3.a - 1);
                B.scale.x = (scaledWidth - L.defaultWidth - R.defaultWidth) / B.defaultWidth;
                B.x = (matrix2x3.tx - B.bounds.minX * (B.scale.x - 1)) + L.bounds.minX * (matrix2x3.a - 1);

                // Y-scaling

                TL.y = matrix2x3.ty + TL.bounds.minY * (matrix2x3.d - 1);
                T.y = matrix2x3.ty + T.bounds.minY * (matrix2x3.d - 1);
                TR.y = matrix2x3.ty + TR.bounds.minY * (matrix2x3.d - 1);

                BL.y = matrix2x3.ty + BL.bounds.maxY * (matrix2x3.d - 1);
                B.y = matrix2x3.ty + B.bounds.maxY * (matrix2x3.d - 1);
                BR.y = matrix2x3.ty + BR.bounds.maxY * (matrix2x3.d - 1);

                L.scale.y = (scaledHeight - T.defaultHeight - B.defaultHeight) / L.defaultHeight;
                L.y = (matrix2x3.ty - L.bounds.minY * (L.scale.y - 1)) + T.bounds.minY * (matrix2x3.d - 1);
                C.scale.y = (scaledHeight - T.defaultHeight - B.defaultHeight) / C.defaultHeight;
                C.y = (matrix2x3.ty - C.bounds.minY * (C.scale.y - 1)) + T.bounds.minY * (matrix2x3.d - 1);
                R.scale.y = (scaledHeight - T.defaultHeight - B.defaultHeight) / R.defaultHeight;
                R.y = (matrix2x3.ty - R.bounds.minY * (R.scale.y - 1)) + T.bounds.minY * (matrix2x3.d - 1);
            }
        }

        this.matrix2x3 = matrix2x3;
        this.colorTransform = colorTransform;
    }
}