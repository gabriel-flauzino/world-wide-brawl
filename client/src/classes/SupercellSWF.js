import { FBSCWEBLoader } from "./FBSCWEBLoader";
import { Game } from "./Game";
import { SCWEBDecompresser } from "./ScFileUnpacker";
import { SWFTexture } from "./swf_objects/SWFTexture";
import { ScMatrixBank } from "./swf_objects/ScMatrixBank";
import { MovieClip } from "./swf_objects/MovieClip";
import { MovieClipComponent } from "../components/swf_components/MovieClip";
import { ShapeComponent } from "../components/swf_components/Shape";
import { TextField } from "./swf_objects/TextField";
import { Shape } from "./swf_objects/Shape";
import { TextFieldComponent } from "../components/swf_components/TextField";
import { Matrix2x3 } from "./swf_objects/Matrix2x3";
import { clearBuffer } from "../helpers/clearBuffer";
import { ExportsManager } from "./swf_objects/ExportsManager";
import { MatrixBanksManager } from "./swf_objects/MatrixBanksManager";
import { TextFieldsManager } from "./swf_objects/TextFieldsManager";
import { ShapesManager } from "./swf_objects/ShapesManager";
import { MovieClipModifiersManager } from "./swf_objects/MovieClipModifiersManager";
import { MovieClipsManager } from "./swf_objects/MovieClipsManager";
import { TexturesManager } from "./swf_objects/TexturesManager";

export class SupercellSWF {
    game;
    filepath;
    filename;
    /**
     * @type {ExportsManager}
     */
    exports;
    /**
     * @type {MatrixBanksManager}
     */
    matrixBanks;
    /**
     * @type {TextFieldsManager}
     */
    textFields;
    /**
     * @type {ShapesManager}
     */
    shapes;
    /**
     * @type {MovieClipModifiersManager}
     */
    movieClipModifiers;
    /**
     * @type {MovieClipsManager}
     */
    movieClips;
    /**
     * @type {TexturesManager}
     */
    textures;

    /**
     * 
     * @param {Game} game 
     */
    constructor(game) {
        this.game = game;
    }

    async load(filepath, onProgress) {
        this.filepath = filepath;
        this.filename = filepath.split(/\\|\//).pop().replace(".scweb", "");

        let msg = (m, ...a) => {
            console.log(`[${this.filename}] ${m}`, ...a)
        }
        
        // fetching file
        let fileData = await fetch(filepath)
        .then(res => res.arrayBuffer());
        if (onProgress && typeof onProgress == "function") {
            onProgress();
        }

        // decompressing file
        let decompressed = new SCWEBDecompresser(fileData).decompress();
        if (onProgress && typeof onProgress == "function") {
            onProgress();
        }
        
        // deserializing data
        let loader = new FBSCWEBLoader(this, decompressed);
        clearBuffer(decompressed);
        if (onProgress && typeof onProgress == "function") {
            onProgress();
        }

        this.exports = loader.exports;
        this.matrixBanks = loader.matrixBanks;
        this.textFields = loader.textFields;
        this.shapes = loader.shapes;
        this.movieClipModifiers = loader.modifiers;
        this.movieClips = loader.movieClips;
        this.textures = loader.textures;

        // fetches and loads textures
        await this.textures.loadAll();
        if (onProgress && typeof onProgress == "function") {
            onProgress();
        }

        console.log(this);

        return this;
    }

    getObject(id) {
        if (this.shapes.indexes.get(id) != undefined) {
            return this.shapes.get(id);
        }
        
        if (this.movieClips.indexes.get(id) != undefined) {
            return this.movieClips.get(id);
        }
        
        if (this.textFields.indexes.get(id) != undefined) {
            return this.textFields.get(id);
        }
        
        if (this.movieClipModifiers.indexes.get(id) != undefined) {
            return this.movieClipModifiers.get(id);
        }

        throw new Error(`Unable to find some DisplayObject id ${id}, from ${this.filename}`);
    }

    /**
     * Returns the PIXI DisplayObject of an object.
     * @param {number} id 
     * @returns 
     */
    render(id) {
        let object = this.getObject(id);
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
            return component.render();
        } else {
            throw new Error(`Object with id ${id} is not renderable in root: ${object.constructor.name}`)
        }
    }

    renderByName(name) {
        let id = this.exports.getByName(name).id;
        return this.render(id);
    }

    /**
     * Renders a MovieClip
     * @param {string} name 
     * @returns {MovieClipComponent}
     */
    renderMovieClipByName(name) {
        let component = this.renderByName(name);
        if (component instanceof MovieClipComponent) {
            return component;
        } else {
            throw new Error(`Object with name ${name} is not a MovieClip`);
        }
    }
}