export class Export {
    constructor(swf, id, name) {
        this.swf = swf;
        this._id = id;
        this._name = name;
    }

    id() { return this._id; }
    name() { return this._name; }
}