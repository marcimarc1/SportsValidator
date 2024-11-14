export function seededRandom(seed) {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

export function generateColor(value) {
    var r = Math.floor(seededRandom(value) * 256);
    var g = Math.floor(seededRandom(value + 1) * 256);
    var b = Math.floor(seededRandom(value + 2) * 256);
    return { r, g, b };
}