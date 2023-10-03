import React, { useState } from 'react';
import { TextField, Button, Typography, Grid, Paper, makeStyles } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { loginUser } from '../features/user/userSlice';
import { Helmet } from 'react-helmet';
import axiosInstance from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
    backgroundImage: 'url(/lionel.jpg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  paper: {
    padding: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  header: {
    marginBottom: theme.spacing(4),
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(1),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2), // Adjust the gap between the fields
  },
  formRow: {
    display: 'flex',
    justifyContent: 'space-evenly',
  },
  textField: {
    flex: 1, // To evenly space the text fields
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  footer: {
    marginTop: theme.spacing(4),
  },
}));

const Login = ({ onLoginSuccess }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      setError('Please enter your username and password.');
      return;
    }

    try {
      const response = await axiosInstance.post('/users/login', formData);
      if (response.data.access_token) {
          axiosInstance.defaults.headers['Authorization'] = 'Bearer ' + response.data.access_token;
          dispatch(loginUser(response.data.user));
          navigate('/collection');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };

  return (
    <Grid container className={classes.root} justifyContent="center" alignItems="center">
      <Helmet><title>Login - Merola Station</title></Helmet>

      <Grid item xs={12} sm={8} md={5}>
        <Paper className={classes.paper} elevation={5}>
          <header className={classes.header}>
            <Typography variant="h2" align="center">
              Merola Station
            </Typography>
          </header>        
          <main>
            <Typography variant="h4" align="center">Login</Typography>
            {error && <Typography color="error">{error}</Typography>}
            <form onSubmit={handleSubmit} className={classes.form}>
                <div style={{ display: 'flex' }}>
                <TextField
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    style={{ marginRight: '1rem' }} // Adjust the margin as needed
                />
                <TextField
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    style={{ marginLeft: '1rem' }} // Adjust the margin as needed
                />
                </div>
                <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                >
                Login
                </Button>
            </form>
            <Typography variant="h6" align="center">
                The inventory solution for your Lionel Train Collection.
            </Typography>
          </main>

          <footer className={classes.footer}>
            <Typography align="center">&copy; 2023 Merola Station</Typography>
          </footer>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Login;
