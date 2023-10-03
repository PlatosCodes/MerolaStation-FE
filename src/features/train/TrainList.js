import React, { useState } from 'react';
import {
  Table, TableHead, TableRow, TableCell, TableBody, Typography, 
  TextField, Container, Paper, Grid, IconButton, Button
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../user/userSlice';
import axiosInstance from '../../api/axiosInstance';


const TrainList = ({ userId: propUserId }) => {
  const [modelNumber, setModelNumber] = useState('');
  const pageId = 1;
  const pageSize = 25;
  const user = useSelector(selectUser);
  const userId = propUserId || user.id; // Use prop if provided, otherwise fall back to Redux state
  
  const fetchTrains = (modelNumber) => {
    const endpoint = modelNumber 
      ? `/trains/search/${modelNumber}?page_id=${pageId}&page_size=${pageSize}`
      : `/trains?page_id=${pageId}&page_size=${pageSize}`;
  
    return axiosInstance.get(endpoint).then(res => res.data);
  };

  const { data: trains, isError, isLoading } = useQuery(['trains', modelNumber], () => fetchTrains(modelNumber));

  if (isLoading) {
      return <p>Loading trains...</p>;
  }

  if (isError) {
      return <p>Error loading trains.</p>;
  }
    
  const handleSearchChange = (e) => {
    setModelNumber(e.target.value);
    }

  const handleSearchSubmit = () => {
    // refetch the trains based on model number
    fetchTrains(modelNumber);
  };

  const addTrainToCollection = async (trainId) => {
    try {
      const response = await axiosInstance.post(`/users/${userId}/collection/${trainId}`);
      if (response.status === 200) {
        alert('Train added to collection successfully!');
      }
    } catch (err) {
      alert('Error adding train to collection.');
    }
  };

  if (isError) {
    return <p>Error loading trains.</p>;
  }

  return (
    <Container>
      <Button variant="outlined" color="primary" onClick={() => window.history.back()}>Go Back</Button>
      <Typography variant="h4" gutterBottom>Trains</Typography>
      
      <Grid container spacing={3} alignItems="flex-end">
        <Grid item xs={10}>
          <TextField 
            fullWidth 
            label="Search by Model Number" 
            value={modelNumber} 
            onChange={handleSearchChange}
          />
        </Grid>
        <Grid item xs={2}>
          <IconButton type="submit" color="primary" size="medium" onClick={handleSearchSubmit}>
            <SearchIcon />
          </IconButton>
        </Grid>
      </Grid>

      <Paper style={{ marginTop: '2rem' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Model Number</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trains && trains.map(train => (
              <TableRow key={train.id}>
                <TableCell>{train.model_number}</TableCell>
                <TableCell>{train.name}</TableCell>
                <TableCell>{train.value}</TableCell>
                <TableCell>
                  <Link to={`/trains/${train.id}`}>View Details</Link>
                  <Button variant="outlined" color="primary" onClick={() => addTrainToCollection(train.id)}>
                    Add to Collection
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}

export default TrainList;
