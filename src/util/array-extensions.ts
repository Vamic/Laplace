declare global {
    interface Array<T> {
        rand: () => T;
    }
}

Array.prototype.rand = function <T>(): T {
    return this[Math.floor(Math.random() * this.length)]
}

export { };