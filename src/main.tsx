import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

const originMeta = document.createElement("meta");
originMeta.httpEquiv = "origin-trial";
originMeta.content = import.meta.env.VITE_TRANSLATOR_TOKEN;
document.head.append(originMeta);

const originTrial = document.createElement("meta");
originTrial.httpEquiv = "origin-trial";
originTrial.content = import.meta.env.VITE_LANGUAGE_TOKEN;
document.head.append(originTrial);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
