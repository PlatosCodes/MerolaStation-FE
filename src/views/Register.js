import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useNavigate, Link } from 'react-router-dom';
import { TextField, Button, Grid, Container, Typography, Paper, makeStyles, } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    marginBottom: theme.spacing(2),
  },
}));

const Register = () => {
    const classes = useStyles();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    const [error, setError] = useState(null);

    const validateForm = () => {
        if (!username || !email || !password) {
          setError("All fields are required!");
          return false;
        }
        const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
        if (!email.match(emailRegex)) {
          setError("Please enter a valid email!");
          return false;
        }
        return true;
      };
      
    const handleSubmit = async (e) => {
        e.preventDefault();
      
        const isValid = validateForm();
      
        if (!isValid) return;
        else {
        try {
            await axiosInstance.post("/users", { username, email, password });
            setSuccessMessage("Registration successful! Please check your email for a verification link.");
            setUsername('');
            setEmail('');
            setPassword('');
            navigate('/login');
            } catch (err) {
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError('An unexpected error occurred.');
            }
            }
      }
    }
    
    return (
        <Container component={Paper} className={classes.root} maxWidth="xs">
          <Typography variant="h4" className={classes.title}>Register</Typography>
        {successMessage && <Typography color="primary">{successMessage}</Typography>}
        {error && <Typography color="error">{error}</Typography>}
        <Container>
        <Grid container spacing={3}>
          <Grid item xs={12}>
          <TextField fullWidth label="Username" variant="outlined" value={username} onChange={(e) => setUsername(e.target.value)} />
          </Grid>
          <Grid item xs={12}>
          <TextField fullWidth label="Password" variant="outlined" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Grid>
          <Grid item xs={12}>
          <TextField fullWidth label="Email" variant="outlined" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              Register
            </Button>
          </Grid>
        </Grid>
      </Container>
      </Container>

    );
}

export default Register;
  