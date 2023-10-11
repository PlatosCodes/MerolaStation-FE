import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { Table, TableHead, TableRow, TableCell, TableBody, Typography, Button, makeStyles } from '@material-ui/core';
import { useQuery, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../user/userSlice';
import { useAddTrainToWishlist } from '../wishlist/useAddTrainToWishlist'; // Adjust path

const useStyles = makeStyles((theme) => ({
    tableHeader: {
        fontWeight: 'bold',
        backgroundColor: theme.palette.primary.light,
        color: theme.palette.primary.contrastText,
    },
    centeredText: {
        textAlign: 'center',
    }
}));

const fetchCollection = (userId, pageId, pageSize) =>
    axiosInstance.get(`/users/${userId}/collection?page_id=${pageId}&page_size=${pageSize}`).then(res => ({
        trains: res.data.trains,
        totalValue: res.data.totalValue
    }));

const UserCollection = ({ userId: propUserId }) => {
    const classes = useStyles();
    const user = useSelector(selectUser);
    const pageId = 1;
    const pageSize = 25;
    const userId = propUserId || user.id;
    const queryClient = useQueryClient();
    const [totalValue, setTotalValue] = useState(0);


    const { data: collectionData, isError, isLoading } = useQuery(['collection', userId], () => fetchCollection(userId, pageId, pageSize));
    console.log("API Response:", collectionData);
    const [collection, setCollection] = useState([]);

    useEffect(() => {
        if (collectionData && collectionData.trains && typeof collectionData.totalValue === 'number') {
            setCollection(collectionData.trains);
            setTotalValue(collectionData.totalValue);
        }
    }, [collectionData]);
    
    
    if (collectionData) {
        console.log("here oy:", collectionData.totalValue);
    }
    
    const handleAddToWishlist = async (trainId) => {
        addTrainToWishlist(trainId);

        // Update the local collection
        const updatedCollection = collection.map(train => 
            train.id === trainId 
                ? { ...train, is_in_wishlist: true } 
                : train
        );
        setCollection(updatedCollection);
    };

    const handleRemoveFromWishlist = async (userId, trainId) => {
        removeTrainFromWishlist(userId, trainId);

        // Update the local collection
        const updatedCollection = collection.map(train => 
            train.id === trainId 
                ? { ...train, is_in_wishlist: false } 
                : train
        );
        setCollection(updatedCollection);
    };
    const {
      addTrainToWishlist,
      removeTrainFromWishlist
    } = useAddTrainToWishlist(user.id);

    if (isLoading) {
        return <p>Loading collection...</p>;
    }

    if (isError) {
        return <p>Error loading collection. Please try again later.</p>;
    }

    const removeFromCollection = async (trainId) => {
        const previousCollection = collection;
        const removedTrain = collection.find(train => train.id === trainId); // Find the train to be removed
        const updatedCollection = collection.filter(train => train.id !== trainId);
    
        if (removedTrain) {
            setTotalValue(prevTotal => prevTotal - removedTrain.value); // Subtract the value of the removed train
        }
        setCollection(updatedCollection);
        queryClient.setQueryData(['collection', userId], updatedCollection);
      
        try {
            await axiosInstance.delete(`/users/${userId}/collection/${trainId}`);
        } catch (err) {
            // If the API call fails, revert the optimistic updates
            setCollection(previousCollection);
            if (removedTrain) {
                setTotalValue(prevTotal => prevTotal + removedTrain.value); // Add back the value of the removed train
            }
            queryClient.invalidateQueries(['collection', userId]);
            console.error(err);
            alert('Failed to remove the train. Please try again.');
        }
    };
    

  // const addToWishlist = async (trainId) => {
  //   try {
  //     await axiosInstance.post(`/users/${userId}/wishlist/${trainId}`);
  //     queryClient.invalidateQueries(['wishlist', userId]);
  //     alert('Train added to wishlist.');
  //   } catch (err) {
  //     console.error(err);
  //     alert('Failed to add the train to the wishlist. Please try again.');
  //   }
  // };

  return (
    <div>
      <div style={{padding: '10px'}}></div>
      <Typography variant="h4" className={classes.centeredText} gutterBottom>My Collection</Typography>
      <Typography variant="h6" className={classes.centeredText}>Total Value: ${totalValue}</Typography>
      {collection && collection.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h5">Your collection is empty!</Typography>
          <Typography variant="subtitle1">Start by adding some trains to your collection.</Typography>
          <Button variant="contained" color="primary" component={Link} to="/trains">
            Browse Trains
          </Button>
        </div>
      ) : (
        <>
          <Button variant="contained" color="primary" component={Link} to="/trains" style={{ margin: '10px 0' }}>
            Add More Trains
          </Button>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell className={`${classes.centeredText} ${classes.tableHeader}`}></TableCell>
                        <TableCell className={`${classes.centeredText} ${classes.tableHeader}`}>Model Number</TableCell>
                        <TableCell className={`${classes.centeredText} ${classes.tableHeader}`}>Name</TableCell>
                        <TableCell className={`${classes.centeredText} ${classes.tableHeader}`}>Value</TableCell>
                        <TableCell className={`${classes.centeredText} ${classes.tableHeader}`}>Details</TableCell>
                        <TableCell className={`${classes.centeredText} ${classes.tableHeader}`}>Wishlist</TableCell>
                        <TableCell className={`${classes.centeredText} ${classes.tableHeader}`}>Remove</TableCell>

                    </TableRow>
                </TableHead>
                <TableBody>
                    {collection.map(train => (
                        <TableRow key={train.id}>
                            <TableCell className={classes.centeredText}>
                                <img alt='train' src= {train.img_url || "/train.png"} style={{ width: '50px', height: 'auto' }} />
                            </TableCell>
                            <TableCell className={classes.centeredText}>{train.model_number}</TableCell>
                            <TableCell className={classes.centeredText}>{train.name}</TableCell>
                            <TableCell className={classes.centeredText}>${train.value}</TableCell>
                            <TableCell className={classes.centeredText}>
                                <Link to={`/trains/${train.id}`}>View Details</Link>
                            </TableCell>
                            <TableCell className={classes.centeredText}>
                            {train.is_in_wishlist ? (
                                <Button 
                                    variant="contained" 
                                    color="secondary" 
                                    onClick={() => handleRemoveFromWishlist(user.id, train.id)}>
                                    Remove from Wishlist
                                </Button>
                            ) : (
                                <Button 
                                    variant="contained" 
                                    color="primary" 
                                    onClick={() => handleAddToWishlist(train.id)}>
                                    Add to Wishlist
                                </Button>
                            )}
                            </TableCell>
                            <TableCell className={classes.centeredText}>
                              <Button onClick={() => removeFromCollection(train.id)} variant="contained" color="secondary">Remove</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>
        )}
    </div>
);
}

export default UserCollection;

