import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

function ActivateAccount() {
    const [status, setStatus] = useState('Loading...');
    
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const userId = params.get('user_id');
        const activationToken = params.get('activation_token');
        // Ensure that the parameters are present
        if (!userId || !activationToken) {
            setStatus('Invalid activation link.');
            return;
        }
        console.log(userId)

        axiosInstance.post('/activate', {
            user_id: parseInt(userId, 10),
            activation_token: activationToken
        }).then(response => {
            setStatus('User successfully activated!');
        }).catch(error => {
            setStatus('Failed to activate user.');
        });
    }, []);
    
    return (
        <div>
            <h1>Activation Status</h1>
            <p>{status}</p>
        </div>
    );
}

export default ActivateAccount;
