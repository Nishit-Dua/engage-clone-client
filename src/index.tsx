import React from "react";
import ReactDOM from "react-dom";

import "./styles/index.scss";
import App from "./App";
import { AuthProvider } from "./context/AuthProvider";
import { AppProvider } from "./context/AppProvider";

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
