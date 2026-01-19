export const deepClone = <T>(arg: T): T => JSON.parse(JSON.stringify(arg));
