import { Database, RunResult } from "sqlite3";
import { Collection } from "./Collection";
import crypto from "crypto";
import { v4 } from "uuid";
import { sanitizeUser } from "../utils";

export class UsersCollection extends Collection {
    constructor(db: Database) {
        super(db);

        this.db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                token TEXT NOT NULL,
                username TEXT NOT NULL,
                coins INTEGER NOT NULL,
                gems INTEGER NOT NULL
            );  
        `)
    }

    async insert(user: { username: string, coins?: number, gems?: number }) {
        user.coins = user.coins || 0;
        user.gems = user.gems || 0;
        const id = v4();
        const token = crypto.randomBytes(32).toString("hex");
        let err: Error | null = await new Promise(res => 
            this.db.run(`INSERT INTO users (id, token, username, coins, gems) VALUES (?, ?, ?, ?, ?)`, [
                id,
                token, 
                user.username, 
                user.coins, 
                user.gems,
            ], res)
        );
        if (err)
            return { error: err };
        else
            return { ...user, id, token };
    }

    async getByToken(token: string) {
        let result: { err: Error | null, row: any } = await new Promise(res => 
            this.db.get("SELECT * FROM users WHERE token = ?", [token], (err: Error | null, row: any) => res({err, row}))
        )
        if (result.err)
            return { error: result.err }
        else
            return result.row;
    }

    async getById(id: string) {
        let result: { err: Error | null, row: any } = await new Promise(res => 
            this.db.get("SELECT * FROM users WHERE id = ?", [id], (err: Error | null, row: any) => res({err, row}))
        )
        if (result.err)
            return { error: true }
        else
            return sanitizeUser(result.row);
    }

    async update(changes: { [key: string]: any }, options?: { upsert?: boolean }) {
        let sanitized = sanitizeUser(changes);

        let err: Error | null = await new Promise(res =>
            this.db.run(`UPDATE users SET ${Object.keys(sanitized).map(key => `${key} = ?`).join(", ")} WHERE id = ?`, [...Object.values(changes), changes.id], res)
        )
        if (err)
            return { error: true };
        else
            return { error: false };
    }
}