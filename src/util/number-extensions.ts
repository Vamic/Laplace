declare global {
    interface Number {
        toDoubleDigit: () => string;
        toMSS: (sourceUnit: TimeUnit) => string;
    }
}

export enum TimeUnit {
    Milliseconds,
    Seconds
}

Number.prototype.toDoubleDigit = function (): string {
    return '' + (Number(this) < 10 ? "0" + this : '' + this);
}

Number.prototype.toMSS = function (sourceUnit: TimeUnit): string {
    const numInSeconds = Math.round(Number(this) / (sourceUnit == TimeUnit.Milliseconds ? 1000 : 1));

    const minutes = Math.floor(numInSeconds / 60);
    const seconds = numInSeconds - minutes * 60;

    return minutes + ":" + seconds.toDoubleDigit();
}
