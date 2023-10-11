import React, { useState } from 'react';
import { TextField, Button, Typography } from '@material-ui/core';
import axiosInstance from '../api/axiosInstance';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleForgotPassword = async () => {
    try {
      await axiosInstance.post('/users/forgot_password', { email });
      setFeedback('Password reset link has been sent to your email.');
    } catch (err) {
      setFeedback('Error sending reset link. Please try again.');
    }
  };

  return (
    <div>
      <Typography variant="h6">Forgot Password</Typography>
      <TextField 
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button onClick={handleForgotPassword}>Send Reset Link</Button>
      <Typography>{feedback}</Typography>
    </div>
  );
};

export default ForgotPassword;
