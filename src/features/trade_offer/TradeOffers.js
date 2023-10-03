import React, { useState, useEffect } from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody, Typography, Button } from '@material-ui/core';
import axiosInstance from '../../api/axiosInstance';


const TradeOffers = ({ userId }) => {
    const [offers, setOffers] = useState([]);

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const response = await axiosInstance.get(`/users/trade_offers/all/${userId}`);
                setOffers(response.data);
            } catch (err) {
                console.error(err);
            }
        }

        fetchOffers();
    }, [userId]);

    // This is a simple view. You'd also want components for initiating trades, accepting trades, etc.

    return (
        <div>
            <Typography variant="h4">Trade Offers</Typography>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Offered Train</TableCell>
                        <TableCell>Requested Train</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {offers.map(offer => (
                        <TableRow key={offer.id}>
                            <TableCell>{offer.offered_train}</TableCell>
                            <TableCell>{offer.requested_train}</TableCell>
                            <TableCell>{offer.status}</TableCell> {/* assuming there's a status field */}
                            <TableCell>
                                {/* Depending on the status and the user, you might have different actions available. This is just a basic example. */}
                                {offer.status === 'pending' && 
                                    <>
                                        <Button color="primary" onClick={() => acceptTrade(offer.id)}>Accept</Button>
                                        <Button color="secondary" onClick={() => declineTrade(offer.id)}>Decline</Button>
                                    </>
                                }
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );

    async function acceptTrade(offerId) {
        try {
            await axiosInstance.post(`/trade`, { offerId: offerId }); // this endpoint and payload might vary
            setOffers(offers.filter(offer => offer.id !== offerId));
        } catch (err) {
            console.error(err);
        }
    }

    async function declineTrade(offerId) {
        try {
            await axiosInstance.delete(`/users/trade_offer`, { data: { offerId: offerId } }); // assuming you're sending the offerId in the request body
            setOffers(offers.filter(offer => offer.id !== offerId));
        } catch (err) {
            console.error(err);
        }
    }
}

export default TradeOffers;
