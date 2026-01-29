import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        primary: {
            main: "#4caf50", // Verde personalizzato
        },
        secondary: {
            main: "#ff5722", // Arancione personalizzato
        },
        background: {
            default: "#ffe6b8", // Sfondo grigio chiaro
        },
        telegram: {
            main: "#28a8e9", // Colore di Telegram
        },
        text: {
            primary: "#212121", // Testo nero
            secondary: "#757575", // Testo grigio
        },
    },
});

export default theme;
