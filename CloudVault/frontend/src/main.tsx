import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./Application";
import { initializeTheme } from "./theme";
import "@fontsource-variable/inter";
import "./design.css";
import "./product.css";
initializeTheme();
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
