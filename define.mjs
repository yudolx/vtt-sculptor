const x = (string) => JSON.stringify(string);

export const __APP_NAME__ = x("VTTSculpt");
export const __DEVELOPMENT__ = x(process.env.NODE_ENV === "development");
