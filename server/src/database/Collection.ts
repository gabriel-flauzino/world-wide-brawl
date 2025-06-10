import { Database } from "sqlite3";

export class Collection {
    db: Database;

    constructor(db: Database) {
        this.db = db; 
    }
}