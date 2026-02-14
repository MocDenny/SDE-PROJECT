import { useState } from "react";
import { Container, TextField, Button, Typography, Box, Paper } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import TopBar from "./components/TopBar";
import Footer from "./components/Footer";

const API_URL = import.meta.env.VITE_AUTH_SERVICE_URL || "http://localhost:3006";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const validateForm = () => {
        const newErrors = {};

        if (!email) {
            newErrors.email = "Email is required.";
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "Email is not valid.";
        }

        if (!password) {
            newErrors.password = "Password is required.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            const res = await axios.post(`${API_URL}/login`, {
                email,
                password,
            });

            localStorage.setItem("user", JSON.stringify(res.data));

            //alert("Login riuscito!");
            //console.log("Login successful:", res.data);
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
                <Box mt={4}>
                    <Paper elevation={3}>
                        <Box p={3} mt={8} display='flex' flexDirection='column' gap={2}>
                            <Typography variant='h4'>Login</Typography>

                            <TextField
                                label='Email'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                error={!!errors.email}
                                helperText={errors.email}
                            />

                            <TextField
                                label='Password'
                                type='password'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                error={!!errors.password}
                                helperText={errors.password}
                            />

                            <Button variant='contained' onClick={handleLogin}>
                                Login
                            </Button>
                        </Box>
                    </Paper>
                </Box>
            </Container>
            <Footer />
        </>
    );
}
