import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Container,
    Box,
    Grid,
    Paper,
    Typography,
    Card,
    CardMedia,
    CardContent,
} from "@mui/material";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import TopBar from "./components/TopBar";
import Footer from "./components/Footer";

const Home = () => {
    const navigate = useNavigate();
    const isLoggedIn = Boolean(localStorage.getItem("user"));

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/");
    };

    return (
        <div>
            <TopBar />
            <Container maxWidth='lg' sx={{ mt: 4 }}>
                <Grid container spacing={4} justifyContent='center'>
                    <Grid item xs={12} md={10} lg={8}>
                        <Paper
                            elevation={3}
                            sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                            <Carousel showThumbs={false} autoPlay infiniteLoop>
                                <div>
                                    <img
                                        src='/image1.jpg'
                                        alt='Carosello 1'
                                        style={{ width: "100%", objectFit: "cover" }}
                                    />
                                    <Typography
                                        variant='subtitle1'
                                        sx={{
                                            position: "absolute",
                                            bottom: 30,
                                            left: "50%",
                                            transform: "translateX(-50%)",
                                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                                            padding: "8px 16px",
                                            borderRadius: 2,
                                            fontWeight: "bold",
                                            fontSize: "2rem",
                                        }}>
                                        Plan your meals
                                    </Typography>
                                </div>
                                <div>
                                    <img
                                        src='/image2.jpg'
                                        alt='Carosello 2'
                                        style={{ width: "100%", objectFit: "cover" }}
                                    />
                                    <Typography
                                        variant='subtitle1'
                                        sx={{
                                            position: "absolute",
                                            bottom: 30,
                                            left: "50%",
                                            transform: "translateX(-50%)",
                                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                                            padding: "8px 16px",
                                            borderRadius: 2,
                                            fontWeight: "bold",
                                            fontSize: "2rem",
                                        }}>
                                        Manage your preferences
                                    </Typography>
                                </div>
                                <div>
                                    <img
                                        src='/image3.jpg'
                                        alt='Carosello 3'
                                        style={{ width: "100%", objectFit: "cover" }}
                                    />
                                    <Typography
                                        variant='subtitle1'
                                        sx={{
                                            position: "absolute",
                                            bottom: 30,
                                            left: "50%",
                                            transform: "translateX(-50%)",
                                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                                            padding: "8px 16px",
                                            borderRadius: 2,
                                            fontWeight: "bold",
                                            fontSize: "2rem",
                                        }}>
                                        Discover new recipes
                                    </Typography>
                                </div>
                                <div>
                                    <img
                                        src='/image4.jpg'
                                        alt='Carosello 4'
                                        style={{ width: "100%", objectFit: "cover" }}
                                    />
                                    <Typography
                                        variant='subtitle1'
                                        sx={{
                                            position: "absolute",
                                            bottom: 30,
                                            left: "50%",
                                            transform: "translateX(-50%)",
                                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                                            padding: "8px 16px",
                                            borderRadius: 2,
                                            fontWeight: "bold",
                                            fontSize: "2rem",
                                        }}>
                                        Generate your shopping list
                                    </Typography>
                                </div>
                                <div>
                                    <img
                                        src='/image5.jpg'
                                        alt='Carosello 5'
                                        style={{ width: "100%", objectFit: "cover" }}
                                    />
                                    <Typography
                                        variant='subtitle1'
                                        sx={{
                                            position: "absolute",
                                            bottom: 30,
                                            left: "50%",
                                            transform: "translateX(-50%)",
                                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                                            padding: "8px 16px",
                                            borderRadius: 2,
                                            fontWeight: "bold",
                                            fontSize: "2rem",
                                        }}>
                                        Stay healthy with us
                                    </Typography>
                                </div>
                            </Carousel>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={10} lg={8}>
                        <Box textAlign='center' sx={{ mt: 4 }}>
                            <Typography variant='h4' gutterBottom>
                                Discover our features!
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid container spacing={4} sx={{ mt: 2 }}>
                        <Grid item xs={12} md={6}>
                            <Card sx={{ display: "flex" }}>
                                <CardMedia
                                    component='img'
                                    sx={{ width: 320 }}
                                    src='/mealPlanning.jpg'
                                    alt='Meal planning'
                                />
                                <CardContent>
                                    <Typography component='h5' variant='h5'>
                                        Plan Your Week, One Meal at a Time
                                    </Typography>
                                    <Typography variant='subtitle1' color='text.secondary'>
                                        Say goodbye to daily “what should I cook today?” moments.
                                        The platform creates a complete weekly meal plan tailored to
                                        your preferences, helping you stay organized and
                                        stress-free. Each plan is designed to balance variety,
                                        taste, and nutrition, so you can enjoy your meals without
                                        overthinking. Planning ahead has never been this simple and
                                        satisfying.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Card sx={{ display: "flex" }}>
                                <CardContent>
                                    <Typography component='h5' variant='h5'>
                                        Your Grocery List, Ready in Seconds
                                    </Typography>
                                    <Typography variant='subtitle1' color='text.secondary'>
                                        Once your meal plan is ready, your grocery list is
                                        automatically generated for you, removing one more task from
                                        your weekly routine. All the ingredients needed for your
                                        planned meals are collected, grouped, and organized in a
                                        clear and easy-to-use list. This means less time spent
                                        planning, fewer forgotten items, and no need to double-check
                                        recipes while shopping.
                                    </Typography>
                                    <Typography
                                        variant='subtitle1'
                                        color='text.secondary'
                                        sx={{ mt: 2 }}>
                                        The feature is designed to make grocery shopping faster and
                                        more intentional, helping you focus only on what you
                                        actually need. By aligning your shopping list with your meal
                                        plan, the system helps reduce impulse purchases and food
                                        waste, saving both money and resources. Whether you shop
                                        online or in-store, you always have a reliable list ready to
                                        guide you, making the entire process smoother and
                                        stress-free.
                                    </Typography>
                                </CardContent>
                                <CardMedia
                                    component='img'
                                    sx={{ width: 300 }}
                                    image='/shoppingList.jpg'
                                    alt='Generation of the shopping list'
                                />
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Card sx={{ display: "flex" }}>
                                <CardMedia
                                    component='img'
                                    sx={{ width: 320 }}
                                    image='/diet.jpg'
                                    alt='Management of dietary preferences and intolerances'
                                />
                                <CardContent>
                                    <Typography component='h5' variant='h5'>
                                        Meals That Fit You
                                    </Typography>
                                    <Typography variant='subtitle1' color='text.secondary'>
                                        Everyone eats differently, and the system is built with that
                                        in mind. You can personalize your profile by setting your
                                        diet, food preferences, and intolerances, such as
                                        vegetarian, vegan, or gluten-free options. The platform uses
                                        this information to suggest meals that truly fit your
                                        lifestyle. This way, every meal plan feels safe, relevant,
                                        and made just for you.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Card sx={{ display: "flex" }}>
                                <CardContent>
                                    <Typography component='h5' variant='h5'>
                                        Access Everything Through Telegram
                                    </Typography>
                                    <Typography variant='subtitle1' color='text.secondary'>
                                        Manage your meals wherever you are, directly from Telegram.
                                        Thanks to the integrated bot, you can generate meal plans,
                                        check your grocery list, and get updates in a quick and
                                        intuitive way. No need to open a separate app — just send a
                                        message and get what you need. It’s a simple, convenient
                                        experience that fits naturally into your daily routine.
                                    </Typography>
                                </CardContent>
                                <CardMedia
                                    component='img'
                                    sx={{ width: 160 }}
                                    image='/telegramLogo.png'
                                    alt='Access Everything Through Telegram'
                                />
                            </Card>
                        </Grid>
                    </Grid>
                </Grid>
            </Container>
            <Footer />
        </div>
    );
};

export default Home;
