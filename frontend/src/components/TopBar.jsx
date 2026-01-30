import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";

const TopBar = () => {
    const navigate = useNavigate();
    const isLoggedIn = Boolean(localStorage.getItem("user"));

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/");
    };

    return (
        <AppBar position='static' color='primary'>
            <Toolbar>
                <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
                    Welcome!
                </Typography>
                {isLoggedIn ? (
                    <>
                        <Button color='inherit' component={Link} to='/profile'>
                            Profile
                        </Button>
                        <Button color='inherit' onClick={handleLogout}>
                            Logout
                        </Button>
                    </>
                ) : (
                    <>
                        <Button color='inherit' component={Link} to='/login'>
                            Login
                        </Button>
                        <Button color='inherit' component={Link} to='/signup'>
                            Signup
                        </Button>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default TopBar;
