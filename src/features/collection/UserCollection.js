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

const fetchCollection = (userId, pageId, pageSize) =>
    axiosInstance.get(`/users/${userId}/collection?page_id=${pageId}&page_size=${pageSize}`).then(res => res.data);

const UserCollection = ({ userId: propUserId }) => {
    const classes = useStyles();
    const user = useSelector(selectUser);
    const pageId = 1;
    const pageSize = 25;
    const userId = propUserId || user.id;
    const queryClient = useQueryClient();

    const { data: collection, isError, isLoading } = useQuery(['collection', userId], () => fetchCollection(userId, pageId, pageSize));

    if (isLoading) {
        return <p>Loading collection...</p>;
    }

    if (isError) {
        return <p>Error loading collection. Please try again later.</p>;
    }

  const removeFromCollection = async (trainId) => {
    const previousCollection = collection;
    const updatedCollection = collection.filter(train => train.id !== trainId);
    queryClient.setQueryData(['collection', userId], updatedCollection);
  
    try {
      await axiosInstance.delete(`/users/${userId}/collection/${trainId}`);
    } catch (err) {
      queryClient.setQueryData(['collection', userId], previousCollection);
      console.error(err);
      alert('Failed to remove the train. Please try again.');
    }
  };

  return (
    <div>
      <Typography variant="h4">My Collection</Typography>
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
                        <TableCell className={`${classes.centeredText} ${classes.tableHeader}`}>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {collection.map(train => (
                        <TableRow key={train.id}>
                            <TableCell className={classes.centeredText}>
                                <img alt='train' src='./train.png' style={{ width: '50px', height: 'auto' }} />
                            </TableCell>
                            <TableCell className={classes.centeredText}>{train.model_number}</TableCell>
                            <TableCell className={classes.centeredText}>{train.name}</TableCell>
                            <TableCell className={classes.centeredText}>${train.value}</TableCell>
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

