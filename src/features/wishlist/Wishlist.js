import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { Table, TableHead, TableRow, TableCell, TableBody, Typography, Button } from '@material-ui/core';

const Wishlist = ({ userId }) => {
    const [wishlist, setWishlist] = useState([]);

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const response = await axiosInstance.get(`/users/${userId}/wishlist`);
                setWishlist(response.data);
            } catch (err) {
                console.error(err);
            }
        }

        fetchWishlist();
    }, [userId]);

    const removeFromWishlist = async (trainId) => {
        try {
            await axiosInstance.delete(`/users/${userId}/wishlist/${trainId}`);
            setWishlist(wishlist.filter(train => train.id !== trainId));
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div>
            <Typography variant="h4">My Wishlist</Typography>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Model Number</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {wishlist.map(train => (
                        <TableRow key={train.id}>
                            <TableCell>{train.model_number}</TableCell>
                            <TableCell>{train.name}</TableCell>
                            <TableCell>
                                <Button color="secondary" onClick={() => removeFromWishlist(train.id)}>
                                    Remove from Wishlist
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

export default Wishlist;
