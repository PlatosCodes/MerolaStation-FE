import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import axiosInstance from '../../api/axiosInstance';
import { Container, Typography, Paper, Grid, Card, CardContent, CardMedia, Button } from '@material-ui/core';
import { useAddTrainToCollection } from '../collection/useAddTrainToCollection'; // Adjust path
import { useIsTrainInCollection } from '../collection/useIsTrainInCollection'; // Adjust path
import { useSelector } from 'react-redux';
import { selectUser } from '../user/userSlice';  // Adjust the path if needed
import CheckIcon from '@material-ui/icons/CheckCircle';
import { useAddTrainToWishlist, useIsTrainInWishlist } from '../wishlist/useAddTrainToWishlist'; // Adjust path



const fetchTrainById = (id) => axiosInstance.get(`/trains/${id}`).then(res => res.data);


const TrainDetail = () => {
  const { id } = useParams();
  const user = useSelector(selectUser);
  
  const {
    addTrainToCollection,
    removeTrainFromCollection,
    feedbackMessage,
    feedbackType,
    setFeedbackMessage
  } = useAddTrainToCollection(user.id);

  const {
    addTrainToWishlist,
    removeTrainFromWishlist
  } = useAddTrainToWishlist(user.id);

  
  const { data: train, isError } = useQuery(['train', id], () => fetchTrainById(id));
  const { isInCollection, checkTrainInCollection } = useIsTrainInCollection(user.id, id);

  const {isTrainInWishlist, checkTrainInWishlist} = useIsTrainInWishlist(user.id, id);

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
                {checkTrainInCollection(train.id) ? (
                    <Button variant="contained" color="secondary" onClick={() => removeTrainFromCollection(user.id, train.id)}>
                        <CheckIcon style={{ color: 'blue' }} /> In Collection
                    </Button>
                ) : (
                    <Button variant="contained" color="primary" onClick={() => addTrainToCollection(train.id)}>
                        Add to Collection
                    </Button>
                )}
                  {checkTrainInWishlist(train.id) ? (
                      <Button variant="contained" color="secondary" onClick={() => removeTrainFromWishlist(user.id,train.id)}>
                          <CheckIcon style={{ color: 'blue' }} /> In Wishlist
                      </Button>
                  ) : (
                      <Button variant="contained" color="primary" onClick={() => addTrainToWishlist(train.id)}>
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
              image="/train.png"
              title={train.name}
            />
          </Grid>
        </Grid>
      </Paper>
      <Button variant="outlined" color="primary" onClick={() => window.history.back()}>Go Back</Button>
    </Container>
  );
}

export default TrainDetail;