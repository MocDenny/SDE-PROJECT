import React from "react";
import { Box, Container, Typography, Link, Grid, IconButton } from "@mui/material";
import { Facebook, Twitter, Instagram, GitHub } from "@mui/icons-material";

const Footer = () => {
    return (
        <Box
            component='footer'
            sx={{
                mt: "auto",
            }}>
            <Box sx={{ height: 20 }} /> {/* Spazio sopra il footer */}
            <Box
                sx={{
                    bgcolor: "primary.main",
                    color: "white",
                    py: 3,
                }}>
                <Container maxWidth='lg'>
                    <Grid container spacing={4} justifyContent='space-between'>
                        <Grid item xs={12} sm={4}>
                            <Typography variant='h6' gutterBottom>
                                About Us
                            </Typography>
                            <Typography variant='body2'>
                                We are a team dedicated to making meal planning easy and enjoyable
                                for everyone.
                            </Typography>
                            <Typography variant='body2' mt={2}>
                                This project was developed for the Service Design and Engineering
                                course at the University of Trento.
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <Typography variant='h6' gutterBottom>
                                Follow Us
                            </Typography>
                            <Box>
                                <IconButton
                                    color='inherit'
                                    href='https://facebook.com'
                                    target='_blank'>
                                    <Facebook />
                                </IconButton>
                                <IconButton
                                    color='inherit'
                                    href='https://twitter.com'
                                    target='_blank'>
                                    <Twitter />
                                </IconButton>
                                <IconButton
                                    color='inherit'
                                    href='https://instagram.com'
                                    target='_blank'>
                                    <Instagram />
                                </IconButton>
                                <IconButton
                                    color='inherit'
                                    href='https://github.com/MocDenny/SDE-PROJECT'
                                    target='_blank'>
                                    <GitHub />
                                </IconButton>
                            </Box>
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <Typography variant='h6' gutterBottom>
                                Resources
                            </Typography>
                            <Link
                                href='https://github.com/MocDenny/SDE-PROJECT/wiki'
                                color='inherit'
                                underline='hover'>
                                Documentation
                            </Link>
                        </Grid>
                    </Grid>

                    <Box textAlign='center' mt={4}>
                        <Typography variant='body2'>Made with ❤️ by Denise & Luca</Typography>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
};

export default Footer;
