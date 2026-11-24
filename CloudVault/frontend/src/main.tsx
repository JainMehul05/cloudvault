import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./Workspace";
import "@fontsource-variable/inter";
import "./design.css";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
