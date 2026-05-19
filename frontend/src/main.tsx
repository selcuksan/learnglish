import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import "./index.css";
import { WordsProvider } from "./state/WordsProvider";

const routerBase = import.meta.env.BASE_URL.replace(/\/$/, "");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={routerBase}>
      <WordsProvider>
        <App />
      </WordsProvider>
    </BrowserRouter>
  </StrictMode>,
);
