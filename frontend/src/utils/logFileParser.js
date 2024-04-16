export const parseLogFile = (text) => {
    const lines = text.trim().split("\n");
    const result = {};

    lines.forEach((line) => {
        const [key, value] = line.split(": ");
        result[key] = value.trim();
    });

    return result;
};