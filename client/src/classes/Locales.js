import { parse } from "csv-parse/browser/esm/sync";

export class Locales {
    static paths = {
        "en": "texts.csv"
    }
    static locales = null;
    static current = "en";

    static setLocale(locale) {
        this.current = locale;
    }

    static async load() {
        const file = this.paths[this.current];
        let data = await fetch("src/assets/locales/" + file).then(x => x.text());
        this.locales = parse(data, {
            skip_empty_lines: true
        })

        data = null;
    }

    static get(key) {
        return this.locales.find(x => x[0] == key)?.[1];
    }
}