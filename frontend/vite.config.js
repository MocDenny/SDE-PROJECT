import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        host: true,
        // This proxy configuration forwards API login requests to the authentication service
        // (so the browser can call localhost:5173/api/login or localhost:3006/login for the backend and localhost:5173/login for the frontend page)
        proxy: {
            "/api/login": {
                target: "http://authentication-service:3006",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/login/, "/login"),
            },
        },
    },
});
