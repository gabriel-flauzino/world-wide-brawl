import sqlite3 from "sqlite3";
import { UsersCollection } from "./UsersCollection";

export class Database {
    db: sqlite3.Database;
    collections: { users: UsersCollection };

    constructor() {
        this.db = new sqlite3.Database("database.sqlite", (err) => {
            if (err)
                console.log("Could not load database");
            else
                console.log("✅ Database loaded successfully!");
        });

        this.collections = {
            users: new UsersCollection(this.db)
        };
    }

    insert() {
        
    }
}

export const database = new Database();