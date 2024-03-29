import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import axiosInstance from '../../api/axiosInstance';
import { Container, Typography, Paper, Grid, Card, CardContent, CardMedia, Button} from '@material-ui/core';
import { useSelector } from 'react-redux';
import { selectUser } from '../user/userSlice'; 
import CheckIcon from '@material-ui/icons/CheckCircle';
import { useAddTrainToList } from '../train/useAddTrainToList';
import  { useNavigate } from 'react-router-dom';

const fetchTrainById = (id) => axiosInstance.get(`/train_detail/${id}`).then(res => res.data);


const TrainDetail = ({ userId: propUserId } ) => {
  const { id } = useParams();
  const user = useSelector(selectUser);
  const navigate = useNavigate()
  const userId = propUserId || user.id;

  const {
    addTrainToList: addTrainToCollection,
    removeTrainFromList: removeTrainFromCollection,
  } = useAddTrainToList(userId, "collection");
  
  const {
    addTrainToList: addTrainToWishlist,
    removeTrainFromList: removeTrainFromWishlist, 
  } = useAddTrainToList(userId, "wishlist");

  
  const { data: train, isError } = useQuery(['train', id], () => fetchTrainById(id));
  
  // Initialize local state using the fetched data
  const [isInCollection, setIsInCollection] = useState(train?.is_in_collection);
  const [isInWishlist, setIsInWishlist] = useState(train?.is_in_wishlist);
  
  // Update local state when fetched data changes
  useEffect(() => {
    setIsInCollection(train?.is_in_collection);
    setIsInWishlist(train?.is_in_wishlist);
  }, [train]);

  const img_url = train?.img_url || "/train.png"

  if (isError || !train) {
    return (
      <Container>
        <Typography variant="h4" gutterBottom>Error</Typography>
        <Typography variant="body1">
          We encountered an issue fetching the train details. Please go back and try again.
        </Typography>
        {/* Optionally add a "Go Back" button here */}
      </Container>
    );
  }

  const handleAddToCollection = (trainId) => {
    addTrainToCollection(trainId);
    setIsInCollection(true);
  };

  const handleRemoveFromCollection = (userId, trainId) => {
    removeTrainFromCollection(trainId);
    setIsInCollection(false);
  };

  const handleAddToWishlist = (trainId) => {
    addTrainToWishlist(trainId);
    setIsInWishlist(true);
  };

  const handleRemoveFromWishlist = (userId, trainId) => {
    removeTrainFromWishlist(trainId);
    setIsInWishlist(false);
  };

  const handleGoBack = () => {
    if (document.referrer && document.referrer.includes(window.location.origin)) {
      window.history.back();
    } else {
      navigate("/trains");
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>{train.name}</Typography>
      <Paper elevation={3} style={{ padding: '2rem', marginBottom: '2rem' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6">Model Number: {train.model_number}</Typography>
                <Typography variant="h6">Name: {train.name}</Typography>
                <Typography variant="h6">Value: ${train.value}</Typography>
                {isInCollection ? (
                  <Button variant="contained" color="secondary" style={{ width: '200px', height: '40px', margin: '5px' }} onClick={() => handleRemoveFromCollection(user.id, train.id)}>
                    In Collection
                  </Button>
                ) : (
                  <Button variant="contained" color="primary" style={{ width: '200px', height: '40px', margin: '5px' }} onClick={() => handleAddToCollection(train.id)}>
                    Add to Collection
                  </Button>
                )}
                {isInWishlist ? (
                  <Button variant="contained" color="secondary" style={{ width: '200px', height: '40px', margin: '5px' }} onClick={() => handleRemoveFromWishlist(user.id, train.id)}>
                    In Wishlist
                  </Button>
                ) : (
                  <Button variant="contained" color="primary" style={{ width: '200px', height: '40px', margin: '5px' }} onClick={() => handleAddToWishlist(train.id)}>
                    Add to Wishlist
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
          <CardMedia
            component="img"
            alt={train.name}
            height="200" 
            //   image={`/path_to_images/${train.model_number}.jpg`} //use in future
            image={img_url}
            title={train.name}
            style={{ objectFit: 'contain' }} // this line ensures the image scales down properly
          />
          </Grid>
        </Grid>
      </Paper>
      <Button variant="outlined" color="primary" onClick={handleGoBack}>Go Back</Button>
    </Container>
  );
}

export default TrainDetail;