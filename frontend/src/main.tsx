import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import "./index.css";
import { WordsProvider } from "./state/WordsProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <WordsProvider>
        <App />
      </WordsProvider>
    </BrowserRouter>
  </StrictMode>,
);
