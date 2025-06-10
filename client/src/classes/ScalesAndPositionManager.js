import { Game } from "./Game";

export class ScalesAndPositionManager {
    _positions = [];
    _scales = [];
    /**
     * @type { Game }
     */
    game;

    constructor(game) {
        this.game = game;
        window.visualViewport.addEventListener("resize", () => {
            this.rescale();
            this.reposition();
        })
    }

    addPosition(component, options = {}) {
        options.x = options.x ?? component.x;
        options.y = options.y ?? component.y;
        options.padX = options.padX ?? 0;
        options.padY = options.padY ?? 0;
        this._position({ component, options })
        this._positions.push({ component, options });
    }

    addScale(component, options = {}) {
        options.width = options.width ?? component.width;
        options.height = options.height ?? component.height;
        options.resolution = options.resolution ?? component.resolution ?? 1;
        this._scale({ component, options })
        this._scales.push({ component, options });

    }

    addPositionAndScale(component, posOptions, scaleOptions) {
        this.addScale(component, scaleOptions);
        this.addPosition(component, posOptions);
    }

    rescale() {
        for (let scale of this._scales) {
            if (scale.component.destroyed) {
                this._scales = this._scales.filter(x => x.component.uid !== scale.component.uid);
                continue;
            }
            this._scale(scale);
        }
    }

    reposition() {
        for (let position of this._positions) {
            if (position.component.destroyed) {
                this._poisitions = this._positions.filter(x => x.component.uid !== position.component.uid);
                continue;
            }
            this._position(position);
        }
    }

    _scale({ component, options }) {
        if (typeof options.scale === "string") {
            let perc = Number(options.scale.replace("%", ""));
            if (isNaN(perc))
                throw new Error("that shit is not a number: " + options.scale)
            let modeFunc = Math.max;

            if (options.scaleMode) {
                switch (options.scaleMode) {
                    case "max":
                        modeFunc = Math.max;
                        break;
                    case "min":
                        modeFunc = Math.min;
                        break;
                    case "x":
                        modeFunc = (x, y) => x;
                        break;
                    case "y":
                        modeFunc = (x, y) => y;
                        break;
                    default:
                        break;
                }
            }

            let scaleX = (window.visualViewport.width * perc / 100) / options.width;
            let scaleY = (window.visualViewport.height * perc / 100) / options.height;
            let scale = modeFunc(scaleX, scaleY);
            component.resolution = Math.max(scale, 1.5);
            component.scale.set(scale);
        } else {
            let width = this.game.originalWidth * options.width / window.visualViewport.width;
            let scale = options.width / width;
            component.resolution = Math.max(scale, options.resolution);
            component.scale.set(scale);
        }
    }

    _position({ component, options }) {
        const aligments = {
            hor: {
                "start": 0,
                "center": (window.visualViewport.width - component.width) / 2,
                "end": window.visualViewport.width - component.width
            },
            ver: {
                "start": 0,
                "center": (window.visualViewport.height - component.height) / 2,
                "end": window.visualViewport.height - component.height
            }
        }
        if (options.align === "center" && options.anchor) {
            aligments.hor.center = window.visualViewport.width / 2;
            component.anchor.set(0.5, 0);
        }
        let x = aligments.hor[options.align] || options.x;
        let y = aligments.ver[options.vertical] || options.y;
        let scale;
        if (!options.vertical || options.vertical === "start") {
            y += options.padY;
            let width = y * window.visualViewport.width / this.game.originalWidth;
            scale = width / y || 0;
            y *= scale;
        } else if (options.vertical === "end") {
            let distance = window.visualViewport.height - (y + component.height) + options.padY;
            let width = distance * window.visualViewport.width / this.game.originalWidth;
            scale = width / distance || 0;
            distance *= scale;
            y -= distance;
        }

        if (!options.align || options.align === "start") {
            x += options.padX;
            let width = x * window.visualViewport.width / this.game.originalWidth;
            scale = width / x || 0;
            x *= scale;
        } else if (options.align === "end") {
            let distance = window.visualViewport.width - (x + component.width) + options.padX;
            let width = distance * window.visualViewport.width / this.game.originalWidth;
            scale = width / distance || 0;
            distance *= scale;
            x -= distance;
        }

        component.position.set(x, y);
    }
}