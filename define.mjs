const x = (string) => JSON.stringify(string);

export const __APP_NAME__ = x("VTTSculpt");
export const __DARWIN__ = x(process.platform === "darwin");
export const __WIN32__ = x(process.platform === "win32");
export const __LINUX__ = x(process.platform === "linux");
export const __DEVELOPMENT__ = x(process.env.NODE_ENV === "development");
