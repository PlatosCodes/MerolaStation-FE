import React from 'react';
import { AppBar, Toolbar, Typography, Button, makeStyles } from '@material-ui/core';
import axiosInstance from '../api/axiosInstance';
import { useDispatch, useSelector } from 'react-redux'; // Step 1: Import useSelector
import { logoutUser } from '../features/user/userSlice';
import { useNavigate } from 'react-router-dom';
import { selectAuthenticated } from '../features/user/userSlice'; // Adjust the path as necessary


const useStyles = makeStyles((theme) => ({
    appBar: {
        backgroundColor: '#1E213A',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    },
    toolbar: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: theme.spacing(0, 3),
    },
    title: {
        display: 'flex',
        alignItems: 'center',
        fontSize: '1.5rem',
        letterSpacing: '1px',
    },
    logo: {
        marginRight: theme.spacing(2),
        height: '2rem',
        width: '2rem',
    },
    logoutButton: {
        backgroundColor: '#F72585',
        color: '#FFFFFF',
        borderRadius: '8px',
        padding: theme.spacing(1, 2),
        '&:hover': {
            backgroundColor: '#D43F8D',
        }
    },
}));

const Header = () => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await axiosInstance.post('/logout');
            dispatch(logoutUser());
            navigate('/leaving');
        } catch (error) {
            console.error("Error during logout: ", error);
        }
    }
    const isAuthenticated = useSelector(selectAuthenticated);

    return (
        <AppBar position="static" className={classes.appBar}>
            <Toolbar className={classes.toolbar}>
                <Typography variant="h6" className={classes.title}>
                    <img src='./train_logo.svg' alt="App Logo" className={classes.logo} />
                    Merola Station
                </Typography>
                {isAuthenticated && (
                    <Button variant="contained" className={classes.logoutButton} onClick={handleLogout}>
                        Logout
                    </Button>
                )}
            </Toolbar>
        </AppBar>
    );
}

export default Header;