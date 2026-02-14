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
    Paper,
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
        repeatPassword: "",
        diet: "none",
        intolerances: [],
    });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const diets = ["none", "vegeterian", "vegan", "pescaterian", "ketogenic", "paleo"];
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

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = "Email is required.";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is not valid.";
        }

        if (!formData.password) {
            newErrors.password = "Password is required.";
        }

        if (!formData.repeatPassword) {
            newErrors.repeatPassword = "Please repeat your password.";
        } else if (formData.password !== formData.repeatPassword) {
            newErrors.repeatPassword = "Passwords do not match.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        console.log("Submitting form data:", formData);
        try {
            const response = await axios.post(`${API_URL}/signup`, formData);
            if (response.status === 200 || response.status === 201) {
                //alert("Registrazione completata con successo!");
                localStorage.setItem("user", JSON.stringify(response.data));
                navigate("/profile");
            } else {
                alert("Error during registration.");
            }
        } catch (error) {
            console.error("Error during request:", error);
            alert("Error during registration. Please check your data and try again.");
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
                    <Paper elevation={3} sx={{ mt: 4 }}>
                        <Box p={3} display='flex' flexDirection='column' gap={3}>
                            <Typography variant='h4'>Create an account</Typography>

                            <TextField
                                label='Email'
                                name='email'
                                value={formData.email}
                                onChange={handleChange}
                                required
                                error={!!errors.email}
                                helperText={errors.email}
                            />

                            <TextField
                                label='Password'
                                type='password'
                                name='password'
                                value={formData.password}
                                onChange={handleChange}
                                required
                                error={!!errors.password}
                                helperText={errors.password}
                            />

                            <TextField
                                label='Repeat Password'
                                type='password'
                                name='repeatPassword'
                                value={formData.repeatPassword}
                                onChange={handleChange}
                                required
                                error={!!errors.repeatPassword}
                                helperText={errors.repeatPassword}
                            />

                            <Typography variant='body2'>
                                To get personalized meal plans you can provide your dietary
                                preferences:
                            </Typography>

                            <FormControl fullWidth>
                                <InputLabel id='diet-label'>Diet</InputLabel>
                                <Select
                                    name='diet'
                                    value={formData.diet}
                                    onChange={handleChange}
                                    labelId='diet-label'
                                    label='Diet'>
                                    {diets.map((diet) => (
                                        <MenuItem key={diet} value={diet}>
                                            {diet.charAt(0).toUpperCase() + diet.slice(1)}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormGroup>
                                <Typography variant='subtitle1'>Intolerances</Typography>
                                {intolerances.map((intolerance) => (
                                    <FormControlLabel
                                        key={intolerance}
                                        control={
                                            <Checkbox
                                                name='intolerances'
                                                value={intolerance}
                                                checked={formData.intolerances.includes(
                                                    intolerance,
                                                )}
                                                onChange={handleChange}
                                            />
                                        }
                                        label={
                                            intolerance.charAt(0).toUpperCase() +
                                            intolerance.slice(1)
                                        }
                                    />
                                ))}
                            </FormGroup>

                            <Button variant='contained' onClick={handleSubmit}>
                                Sign up
                            </Button>
                        </Box>
                    </Paper>
                </Container>
            </Box>
            <Footer />
        </>
    );
};

export default Signup;
