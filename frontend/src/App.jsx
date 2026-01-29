import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./Home";
import Signup from "./Signup";
import Login from "./Login";
import Profile from "./Profile";
import { Box } from "@mui/material";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Home />,
    },
    {
        path: "/signup",
        element: <Signup />,
    },
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/profile",
        element: <Profile />,
    },
    // ...existing routes
]);

const App = () => {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                boxSizing: "border-box",
                padding: "8px",
                minHeight: "100vh", // Ensure the app takes the full height of the viewport
            }}>
            <RouterProvider router={router} />
        </Box>
    );
};

export default App;
