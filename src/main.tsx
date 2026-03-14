import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource/geist-mono/400.css";
import "@fontsource/geist-mono/500.css";
import "@fontsource/geist-mono/600.css";
import "@fontsource/geist-mono/700.css";
import "@fontsource/geist-mono/800.css";
import "@fontsource/geist-mono/900.css";
import App from "./App";

import { initI18n } from "./i18n/config";

initI18n().then(() => {
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
