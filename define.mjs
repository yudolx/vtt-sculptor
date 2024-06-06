const x = (string) => JSON.stringify(string);

export const __DARWIN__ = process.platform === "darwin";
export const __WIN32__ = process.platform === "win32";
export const __LINUX__ = process.platform === "linux";
export const __DEVELOPMENT__ = process.env.NODE_ENV === "development";
