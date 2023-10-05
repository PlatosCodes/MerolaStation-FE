import React from 'react';
import { AppBar, Toolbar, Typography, Button, makeStyles, BottomNavigation, BottomNavigationAction } from '@material-ui/core';
import TrainIcon from '@material-ui/icons/Train';
import StarIcon from '@material-ui/icons/Star';
import { useDispatch, useSelector } from 'react-redux';
import axiosInstance from '../api/axiosInstance';
import { logoutUser, selectAuthenticated } from '../features/user/userSlice';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
    appBar: {
        backgroundColor: '#1E213A',
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
    bottomNav: {
        backgroundColor: 'white',
        boxShadow: 'none',
    }
}));

const Header = () => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [value, setValue] = React.useState(location.pathname);

    const handleLogout = async () => {
        try {
            await axiosInstance.post('/logout');
            dispatch(logoutUser());
            navigate('/leaving');
        } catch (error) {
            console.error("Error during logout: ", error);
        }
    };

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
            {isAuthenticated && (
                <BottomNavigation 
                value={value} 
                onChange={(event, newValue) => setValue(newValue)} 
                className={classes.bottomNav}
                >
                <BottomNavigationAction label="Collection" value="/collection" icon={<TrainIcon />} component={Link} to="/collection" />
                <BottomNavigationAction label="Wishlist" value="/wishlist" icon={<StarIcon />} component={Link} to="/wishlist" />
                <BottomNavigationAction label="Trains" value="/trains" icon={<TrainIcon />} component={Link} to="/trains" />
            </BottomNavigation>
                )}
        </AppBar>
    );
}

export default Header;
