import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Typography } from '@material-ui/core';

const UserProfile = ({ userId }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axiosInstance.get(`/users/${userId}`);
                setUser(response.data);
            } catch (err) {
                console.error(err);
                // Handle error gracefully here...
            }
        }

        fetchUser();
    }, [userId]);

    if (!user) return <Typography>Loading...</Typography>;

    return (
        <div>
            <Typography variant="h4">{user.username}'s Profile</Typography>
            <Typography variant="h6">Email: {user.email}</Typography>
        </div>
    );
}

export default UserProfile;
