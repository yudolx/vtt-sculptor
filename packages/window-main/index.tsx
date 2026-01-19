import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App } from "./ui/App";
import { VideoElContextProvider } from "@sculptor/shared";
import { PluginsContext } from "@sculptor/helpers/ui/PluginsContext";
import { ThemeProvider } from "@sculptor/helpers/ui/ThemeProvider";
import { InvalidateQueryManager } from "@sculptor/helpers/ui/InvalidateQueryManager";

const queryClient = new QueryClient();

document.addEventListener("DOMContentLoaded", () => {
  const rootEl = document.createElement("div");
  rootEl.id = "root";
  document.body.appendChild(rootEl);

  const reactRoot = createRoot(rootEl);
  reactRoot.render(
    <QueryClientProvider client={queryClient}>
      <InvalidateQueryManager />
      <ThemeProvider>
        <VideoElContextProvider>
          <PluginsContext>
            <App />
          </PluginsContext>
        </VideoElContextProvider>
      </ThemeProvider>
    </QueryClientProvider>,
  );
});
