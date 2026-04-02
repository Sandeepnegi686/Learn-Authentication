import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { APP_PROVIDER } from "./context/AppProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <APP_PROVIDER>
      <App />
    </APP_PROVIDER>
  </StrictMode>,
);
