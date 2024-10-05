import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./ui/app";
import { ThemeProvider } from "shared/ui/ThemeProvider";

document.addEventListener("DOMContentLoaded", () => {
  const rootEl = document.createElement("div");
  rootEl.id = "root";
  document.body.appendChild(rootEl);

  const reactRoot = createRoot(rootEl);
  reactRoot.render(
    <ThemeProvider>
      <App />
    </ThemeProvider>,
  );
});
