import { useState } from "react";
import { Container, TextField, Button, Typography, Box } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import TopBar from "./components/TopBar";
import Footer from "./components/Footer";

const API_URL = import.meta.env.VITE_AUTH_SERVICE_URL || "http://localhost:3006";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const res = await axios.post(`${API_URL}/login`, {
                email,
                password,
            });

            localStorage.setItem("user", JSON.stringify(res.data));

            //alert("Login riuscito!");
            console.log("Login successful:", res.data);
            navigate("/profile");
        } catch (err) {
            console.error("Login error:", err);
            alert("Error during login. Please check your credentials and try again.");
        }
    };

    return (
        <>
            <TopBar />
            <Container maxWidth='sm'>
                <Box mt={8} display='flex' flexDirection='column' gap={2}>
                    <Typography variant='h4'>Login</Typography>

                    <TextField
                        label='Email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <TextField
                        label='Password'
                        type='password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <Button variant='contained' onClick={handleLogin}>
                        Login
                    </Button>
                </Box>
            </Container>
            <Footer />
        </>
    );
}
