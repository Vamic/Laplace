
export function log(msg: string, type: string = "info") {
    if (typeof msg === "string")
        return console.log("[Laplace." + type + "] " + msg);

    console.log("[Laplace." + type + "]");
    console.log(msg);
};
export function warn(msg: string) {
    log(msg, "warn");
};
export function error(msg: string) {
    log(msg, "err");
};