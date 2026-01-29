import React, { useEffect } from "react";
import {
    Container,
    Typography,
    Box,
    Paper,
    List,
    ListItem,
    ListItemText,
    Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import TopBar from "./components/TopBar";
import Footer from "./components/Footer";

const Profile = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate("/");
        }
    }, [navigate, user]);

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/");
    };

    const telegramLink = `https://t.me/plan_meals_bot?start=${user.telegramLinkToken}`;

    return (
        <>
            <TopBar />
            <Container maxWidth='sm'>
                <Box mt={4}>
                    <Paper elevation={3}>
                        <Box p={3}>
                            <Typography variant='h4' gutterBottom>
                                User Profile
                            </Typography>
                            <List>
                                <ListItem>
                                    <ListItemText primary='Email' secondary={user.email} />
                                </ListItem>
                                <ListItem>
                                    <ListItemText
                                        primary='Diet'
                                        secondary={user.preferences?.diet || "None"}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText
                                        primary='Intolerances'
                                        secondary={
                                            user.preferences?.intolerances?.length
                                                ? user.preferences.intolerances.join(", ")
                                                : "None"
                                        }
                                    />
                                </ListItem>
                            </List>
                            <Box display='flex' gap={2} mt={2}>
                                <Button
                                    variant='contained'
                                    color='secondary'
                                    onClick={handleLogout}>
                                    Logout
                                </Button>
                                <Button
                                    variant='contained'
                                    color='telegram'
                                    href={telegramLink}
                                    target='_blank'
                                    rel='noopener noreferrer'>
                                    Connect to Telegram
                                </Button>
                            </Box>
                        </Box>
                    </Paper>
                </Box>
            </Container>
            <Footer />
        </>
    );
};

export default Profile;
