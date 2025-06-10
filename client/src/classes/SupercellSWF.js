import { FlatSupercellSWFLoader } from "./FlatSupercellSWFLoader";
import { Game } from "./Game";
import { ScFileUnpacker } from "./ScFileUnpacker";
import { SWFTexture } from "./swf_objects/SWFTexture";
import { ScMatrixBank } from "./swf_objects/ScMatrixBank";
import { MovieClip } from "./swf_objects/MovieClip";
import { MovieClipComponent } from "../components/swf_components/MovieClip";
import { ShapeComponent } from "../components/swf_components/Shape";
import { TextField } from "./swf_objects/TextField";
import { Shape } from "./swf_objects/Shape";
import { TextFieldComponent } from "../components/swf_components/TextField";
import { Matrix2x3 } from "./swf_objects/Matrix2x3";

export class SupercellSWF {
    game;
    filepath;
    filename;
    exports = [];
    /**
     * @type { ScMatrixBank[] }
     */
    matrixBanks = [];
    textFields = [];
    shapes = [];
    movieClipModifiers = [];
    movieClips = [];
    /**
     * @type {SWFTexture[]}
     */
    textures = [];

    /**
     * 
     * @param {Game} game 
     */
    constructor(game) {
        this.game = game;
    }

    async load(filepath, preferLowres = false) {
        this.filepath = filepath;
        this.filename = filepath.split(/\\|\//).pop().replace(".scweb", "");

        let msg = (m, ...a) => {
            console.log(`[${this.filename}] ${m}`, ...a)
        }

        let s = Date.now();
        msg("fetching");
        let fileData = await fetch(filepath)
            .then(res => res.arrayBuffer());
        msg("fetched in " + (Date.now() - s ) + " ms");

        let s2 = Date.now();
        msg("unpacking")
        let { decompressed } = ScFileUnpacker.unpack(fileData);
        msg("unpacked in " + (Date.now() - s2) + " ms");
        
        let s3 = Date.now();
        msg("deserializing data");
        let loader = new FlatSupercellSWFLoader(this, decompressed, preferLowres);
        msg("deserialized in " + (Date.now() - s3) + " ms");

        this.exports = loader.exports;
        this.matrixBanks = loader.matrixBanks;
        this.textFields = loader.textFields;
        this.shapes = loader.shapes;
        this.movieClipModifiers = loader.modifiers;
        this.movieClips = loader.movieClips;
        this.textures = loader.textures;

        let s4 = Date.now();
        msg("loading textures");
        await this.loadTextures();
        msg("loaded textures in " + (Date.now() - s4) + " ms");

        fileData = null;
        decompressed = null;
        loader = null;

        return this;
    }

    async loadTextures() {
        for (let [i, texture] of Object.entries(this.textures)) {
            await texture.load(i);
        }
    }

    getOriginalMovieClip(id, name) {
        for (let movieClip of this.movieClips) {
            if (movieClip.getId() == id) {
                return movieClip;
            }
        }

        throw new Error(`Unable to find some MovieClip id ${id}, from ${this.filename}${name ? " needed by export name " + name : ""}`);
    }

    getOriginalDisplayObject(id) {
        for (let shape of this.shapes) {
            if (shape.getId() == id) {
                return shape;
            }
        }

        for (let movieClip of this.movieClips) {
            if (movieClip.getId() == id) {
                return movieClip;
            }
        }

        for (let textField of this.textFields) {
            if (textField.getId() == id) {
                return textField;
            }
        }

        for (let movieClipModifier of this.movieClipModifiers) {
            if (movieClipModifier.getId() == id) {
                return movieClipModifier;
            }
        }

        throw new Error(`Unable to find some DisplayObject id ${id}, from ${this.filename}`);
    }

    render(id, matrix2x3 = new Matrix2x3()) {
        let object = this.getOriginalDisplayObject(id);
        let component;

        if (object instanceof MovieClip) {
            component = new MovieClipComponent(object);
        }

        if (object instanceof Shape) {
            component = new ShapeComponent(object);
        }

        if (object instanceof TextField) {
            component = new TextFieldComponent(object);
        }

        if (component) {
            return component.render(undefined, matrix2x3);
        } else {
            throw new Error(`Object with id ${id} is not renderable in root: ${object.constructor.name}`)
        }
    }

    renderByName(name, matrix2x3) {
        let id = this.exports.find(x => x.name() == name)?.id?.();
        return this.render(id, matrix2x3);
    }
}