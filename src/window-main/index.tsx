import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App } from "./ui/App";
import { ThemeProvider } from "shared/ui/ThemeProvider";
import { VideoElContextProvider } from "./ui/context/video-el";
import { InvalidateQueryManager } from "shared/ui/InvalidateQueryManager";

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
          <App />
        </VideoElContextProvider>
      </ThemeProvider>
    </QueryClientProvider>,
  );
});
