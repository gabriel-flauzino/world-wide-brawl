import _ from "lodash";

export function sanitizeUser(data: any) {
    return _.pick(data, ["id", "username", "coins", "gems"]);
}