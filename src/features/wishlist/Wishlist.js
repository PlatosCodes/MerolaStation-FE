import React from 'react';
import axiosInstance from '../../api/axiosInstance';
import { Table, TableHead, TableRow, TableCell, TableBody, Typography, Button, makeStyles } from '@material-ui/core';
import { useQuery, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../user/userSlice';

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

const fetchWishlist = (userId, pageId, pageSize) =>
    axiosInstance.get(`/users/${userId}/wishlist?page_id=${pageId}&page_size=${pageSize}`).then(res => res.data);

const UserWishlist = ({ userId: propUserId }) => {
    const classes = useStyles();
    const user = useSelector(selectUser);
    const pageId = 1;
    const pageSize = 25;
    const userId = propUserId || user.id;
    const queryClient = useQueryClient();

    const { data: wishlist, isError, isLoading } = useQuery(['wishlist', userId], () => fetchWishlist(userId, pageId, pageSize));

    if (isLoading) {
        return <p>Loading wishlist...</p>;
    }

    if (isError) {
        return <p>Error loading wishlist. Please try again later.</p>;
    }

  const removeFromWishlist = async (trainId) => {
    const previousWishlist = wishlist;
    const updatedWishlist = wishlist.filter(train => train.id !== trainId);
    queryClient.setQueryData(['wishlist', userId], updatedWishlist);
  
    try {
      await axiosInstance.delete(`/users/${userId}/wishlist/${trainId}`);
    } catch (err) {
      queryClient.setQueryData(['wishlist', userId], previousWishlist);
      console.error(err);
      alert('Failed to remove the train. Please try again.');
    }
  };

  const addToCollection = async (trainId) => {
    try {
      await axiosInstance.post(`/users/${userId}/collection/${trainId}`);
      queryClient.invalidateQueries(['collection', userId]);
      alert('Train added to collection.');
    } catch (err) {
      console.error(err);
      alert('Failed to add the train to the collection. Please try again.');
    }
};


  return (
    <div>
      <div style={{padding: '10px'}}></div>
      <Typography variant="h4" className={classes.centeredText} gutterBottom>My Wishlist</Typography>
      {wishlist && wishlist.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h5">Your wishlist is empty!</Typography>
          <Typography variant="subtitle1">Start by adding some trains to your wishlist.</Typography>
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
                        <TableCell className={`${classes.centeredText} ${classes.tableHeader}`}>Collection</TableCell>
                        <TableCell className={`${classes.centeredText} ${classes.tableHeader}`}>Remove</TableCell>

                    </TableRow>
                </TableHead>
                <TableBody>
                    {wishlist.map(train => (
                        <TableRow key={train.id}>
                            <TableCell className={classes.centeredText}>
                                <img alt='train' src='./train.png' style={{ width: '50px', height: 'auto' }} />
                            </TableCell>
                            <TableCell className={classes.centeredText}>{train.model_number}</TableCell>
                            <TableCell className={classes.centeredText}>{train.name}</TableCell>
                            <TableCell className={classes.centeredText}>${train.value}</TableCell>
                            <TableCell className={classes.centeredText}>
                              <Button onClick={() => addToCollection(train.id)} variant="contained" color="primary">Add to Collection</Button>
                              </TableCell>
                            <TableCell className={classes.centeredText}>
                              <Button onClick={() => removeFromWishlist(train.id)} variant="contained" color="secondary">Remove</Button>
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

export default UserWishlist;

