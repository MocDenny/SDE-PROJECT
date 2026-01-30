import React, { useState } from "react";
import {
    Container,
    TextField,
    Button,
    Typography,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormGroup,
    FormControlLabel,
    Checkbox,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import TopBar from "./components/TopBar";
import Footer from "./components/Footer";

const API_URL = import.meta.env.VITE_AUTH_SERVICE_URL || "http://localhost:3006";

const Signup = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        diet: "none",
        intolerances: [],
    });
    const navigate = useNavigate();

    const diets = ["ketogenic", "none", "vegan", "vegeterian", "pescaterian", "paleo"];
    const intolerances = [
        "gluten",
        "dairy",
        "egg",
        "peanut",
        "wheat",
        "shellfish",
        "sesame",
        "soy",
        "grain",
    ];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === "checkbox") {
            setFormData((prev) => ({
                ...prev,
                intolerances: checked
                    ? [...prev.intolerances, value]
                    : prev.intolerances.filter((intolerance) => intolerance !== value),
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Submitting form data:", formData);
        try {
            const response = await axios.post(`${API_URL}/signup`, formData);
            if (response.status === 200 || response.status === 201) {
                alert("Registrazione completata con successo!");
                localStorage.setItem("user", JSON.stringify(response.data));
                navigate("/profile");
            } else {
                alert("Errore durante la registrazione.");
            }
        } catch (error) {
            console.error("Errore durante la richiesta:", error);
            alert("Errore durante la registrazione.");
        }
    };

    return (
        <>
            <TopBar />
            <Box
                display='flex'
                justifyContent='center'
                alignItems='center'
                width='100%'
                minHeight='100vh'>
                <Container maxWidth='sm'>
                    <Box display='flex' flexDirection='column' gap={3}>
                        <Typography variant='h4'>Registrazione</Typography>

                        <TextField
                            label='Email'
                            name='email'
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />

                        <TextField
                            label='Password'
                            type='password'
                            name='password'
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />

                        <FormControl fullWidth>
                            <InputLabel>Dieta</InputLabel>
                            <Select name='diet' value={formData.diet} onChange={handleChange}>
                                {diets.map((diet) => (
                                    <MenuItem key={diet} value={diet}>
                                        {diet}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormGroup>
                            <Typography variant='subtitle1'>Intolleranze</Typography>
                            {intolerances.map((intolerance) => (
                                <FormControlLabel
                                    key={intolerance}
                                    control={
                                        <Checkbox
                                            name='intolerances'
                                            value={intolerance}
                                            checked={formData.intolerances.includes(intolerance)}
                                            onChange={handleChange}
                                        />
                                    }
                                    label={intolerance}
                                />
                            ))}
                        </FormGroup>

                        <Button variant='contained' onClick={handleSubmit}>
                            Registrati
                        </Button>
                    </Box>
                </Container>
            </Box>
            <Footer />
        </>
    );
};

export default Signup;
