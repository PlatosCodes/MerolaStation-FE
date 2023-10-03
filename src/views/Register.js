import React, { useState } from 'react';
import { TextField, Button, Typography } from '@material-ui/core';
import axiosInstance from '../api/axiosInstance';


const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        first_name: '',
        hashed_password: ''
    });

    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post("/users", formData);
            // Navigate to login or show success message
        } catch (err) {
            setError(err.response.data.error);
        }
    }

    return (
        <div>
            <Typography variant="h4">Register</Typography>
            {error && <Typography color="error">{error}</Typography>}
            <form onSubmit={handleSubmit}>
                <TextField 
                    label="Username" 
                    name="username" 
                    value={formData.username}
                    onChange={handleChange} 
                />
                <TextField 
                    label="Email" 
                    name="email" 
                    value={formData.email}
                    onChange={handleChange} 
                />
                <TextField 
                    label="First Name" 
                    name="first_name" 
                    value={formData.first_name}
                    onChange={handleChange} 
                />
                <TextField 
                    label="Password" 
                    name="hashed_password" 
                    type="password" 
                    value={formData.hashed_password}
                    onChange={handleChange} 
                />
                <Button type="submit">Register</Button>
            </form>
        </div>
    );
}

export default Register;
