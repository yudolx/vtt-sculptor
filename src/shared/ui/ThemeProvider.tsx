import React from "react";
import { CssBaseline, StyledEngineProvider } from "@mui/joy";

export interface IThemeProviderProps {}

export const ThemeProvider: React.FC<
  React.PropsWithChildren<IThemeProviderProps>
> = (props) => {
  return (
    <StyledEngineProvider injectFirst>
      <CssBaseline />
      {props.children}
    </StyledEngineProvider>
  );
};
