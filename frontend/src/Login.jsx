import { useState } from "react";
import { Container, TextField, Button, Typography, Box } from "@mui/material";
import axios from "axios";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        try {
            const res = await axios.post("http://authentication-service:3006/login", {
                email,
                password,
            });

            localStorage.setItem("token", res.data.token);
            alert("Login riuscito!");
        } catch (err) {
            alert("Credenziali non valide");
        }
    };

    return (
        <Container maxWidth='sm'>
            <Box mt={8} display='flex' flexDirection='column' gap={2}>
                <Typography variant='h4'>Login</Typography>

                <TextField label='Email' value={email} onChange={(e) => setEmail(e.target.value)} />

                <TextField
                    label='Password'
                    type='password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <Button variant='contained' onClick={handleLogin}>
                    Accedi
                </Button>
            </Box>
        </Container>
    );
}
