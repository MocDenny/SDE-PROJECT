import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material"; // Importa CssBaseline
import theme from "./theme"; // Importa il tema personalizzato

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline /> {/* Applica stili globali, incluso il colore di sfondo */}
            <App />
        </ThemeProvider>
    </React.StrictMode>,
);
