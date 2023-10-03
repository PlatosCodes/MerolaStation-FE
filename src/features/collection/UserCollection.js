import React, { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { Table, TableHead, TableRow, TableCell, TableBody, Typography, Button } from '@material-ui/core';
import { useQuery, queryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../user/userSlice';
import { TextField } from '@material-ui/core';
import { fetchTrains } from '../train/trainSlice';


const fetchCollection = (userId, pageId, pageSize) =>
  axiosInstance.get(`/users/${userId}/collection?page_id=${pageId}&page_size=${pageSize}`).then(res => res.data);

const UserCollection = ({ userId: propUserId }) => {
  const [searchResults, setSearchResults] = useState([]);
  const user = useSelector(selectUser)
  const pageId = 1;
  const pageSize = 25;
  const userId = propUserId || user.id; // Use prop if provided, otherwise fall back to Redux state

  const { data: collection, isError, error, isLoading } = useQuery(['collection', userId], () => fetchCollection(userId, pageId, pageSize));

  if (isLoading) {
      return <p>Loading collection...</p>;
  }
  
  if (isError) {
      return <p>Error loading collection: {error.message}</p>;
  }
  const removeFromCollection = async (trainId) => {
    try {
      await axiosInstance.delete(`/users/${userId}/collection/${trainId}`);
      queryClient.invalidateQueries(['collection', userId]);
    } catch (err) {
      console.error(err);
    }
  }

  const handleSearchChange = async (e) => {
    try {
      const modelNumber = e.target.value;
      if (modelNumber) {
        const response = await axiosInstance.get(`/trains/model/${modelNumber}`);
        setSearchResults([response.data]);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error(err);
      setSearchResults([]);
    }
  }

  const handleSearchSubmit = (modelNumber) => {
    // refetch the trains based on model number
    
    fetchTrains(modelNumber);
  };

  return (
    <div>
      <Typography variant="h4">My Collection</Typography>
      {isError ? (
        <p>Error loading collection: {error.message}</p>
      ) : collection && collection.length === 0 ? (
        <div>
          <p>Start adding trains to your collection!</p>
          <Link to="/trains">Browse Trains</Link>
          <div></div>
          <Typography variant="h6">Add a Train to Collection</Typography>
          <TextField
            placeholder="Search by model number"
            onChange={handleSearchChange}
            style={{ width: '16rem', maxWidth: 'none' }} // Add maxWidth: 'none'
            />
          {/* <TextField
            placeholder="Search by train name"
            onChange={handleSearchChange}
            style={{ width: '12rem' }} // Adjust the width as needed
            /> */}
        </div>
      ) : collection ? (
        <>
          <Link to="/trains">Browse Trains</Link>
          <Typography variant="h6">Add a Train to Collection</Typography>
          <TextField placeholder="Search by model" onChange={handleSearchChange} />
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Model Number</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Value</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {collection.map(train => (
                <TableRow key={train.id}>
                  <TableCell>{train.model_number}</TableCell>
                  <TableCell>{train.name}</TableCell>
                  <TableCell>{train.value}</TableCell>
                  <TableCell>
                    <Button onClick={() => removeFromCollection(train.id)} variant="contained" color="secondary">Remove</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
    ) : (
        <p>Loading...</p>
    )}
    </div>
  );
}

export default UserCollection;
