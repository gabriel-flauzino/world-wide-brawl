import { auth } from "@colyseus/auth";
import { database } from "../database/Database";
 
auth.backend_url = "https://2567-idx-world-wide-brawl-1741788168687.cluster-4xpux6pqdzhrktbhjf2cumyqtg.cloudworkstations.dev/";

auth.settings.onRegisterAnonymously = async function (options) {
    const anonymousEntry = { anonymous: true, ...options };
    return anonymousEntry;
}