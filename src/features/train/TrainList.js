import React, { useState, useEffect } from 'react';
import {
  Table, TableHead, TableRow, TableCell, TableBody, Typography, 
  TextField, Container, Paper, Grid, IconButton, Button, List, ListItem,
  Snackbar, SnackbarContent, makeStyles
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import ErrorIcon from '@material-ui/icons/Error';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { useQuery, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../user/userSlice';
import axiosInstance from '../../api/axiosInstance';
import { fetchUserCollection } from '../collection/collectionSlice';
import debounce from 'lodash/debounce';
import { useDispatch } from 'react-redux';
import CircularProgress from '@material-ui/core/CircularProgress';
import { useAddTrainToCollection } from '../collection/useAddTrainToCollection'; // Adjust path


const useStyles = makeStyles((theme) => ({
  centeredText: {
      textAlign: 'center',
  },
  feedbackContainer: {
      marginBottom: '1rem', 
      padding: '0.5rem', 
      borderRadius: '4px' 
  },
  feedbackSuccess: {
      backgroundColor: 'green',
      color: 'white',
  },
  feedbackError: {
      backgroundColor: 'red',
      color: 'white',
  },
  suggestionsDropdown: {
      maxHeight: 200, 
      width: '100%', 
      overflow: 'auto'
  },
  marginTop: {
      marginTop: '2rem'
  }
}));

const FEEDBACK_DISPLAY_DURATION = 3000;  // 3 seconds
const DEFAULT_PAGE_SIZE = 25;

const TrainList = ({ userId: propUserId }) => {
  const [model_number, setmodel_number] = useState('');
  const [suggestions, setSuggestions] = useState([]); // To store search suggestions
  
  const dispatch = useDispatch();
  const userCollection = useSelector(state => state.collection) || [];

  const queryClient = useQueryClient(); // Initialize queryClient

  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState(''); // can be 'success' or 'error'
  
  const user = useSelector(selectUser);
  const userId = propUserId || user.id;

  const {
    addTrainToCollection,
  } = useAddTrainToCollection(userId); // Call the hook here, after `userId` is determined.

  useEffect(() => {
    if(userId) {
        dispatch(fetchUserCollection(userId));
    }
  }, [userId, dispatch]);

  useEffect(() => {
      if (feedbackMessage) {
          const timer = setTimeout(() => {
              setFeedbackMessage('');
              setFeedbackType('');
          }, FEEDBACK_DISPLAY_DURATION);

          return () => clearTimeout(timer);  // Cleanup timer
      }
  }, [feedbackMessage]);
  
  const fetchTrains = (model_number) => {
    return fetchFromAPI(model_number, 1, DEFAULT_PAGE_SIZE);
};


const fetchSuggestions = debounce(async (query) => {
  try {
      const suggestions = await fetchFromAPI(query, 1, 10);
      const uniqueSuggestions = Array.from(new Set(suggestions.map(s => s.model_number)))
                                    .map(model_number => suggestions.find(s => s.model_number === model_number));
      setSuggestions(uniqueSuggestions);
  } catch (error) {
      console.error("Error fetching suggestions", error);
  }
}, 300); 

  const fetchFromAPI = (model_number, pageId, pageSize) => {
    const endpoint = model_number 
      ? `/trains/search?model_number=${model_number}&page_id=${pageId}&page_size=${pageSize}`
      : `/trains?page_id=${pageId}&page_size=${pageSize}`;
    return axiosInstance.get(endpoint).then(res => res.data);
};

  const { data: trains, isError, isLoading } = useQuery(['trains', model_number], () => fetchTrains(model_number));

  if (isLoading) {
      return <p>Loading trains...</p>;
  }

  if (isError) {
      return <p>Error loading trains.</p>;
  }

  const handleSearchSubmit = () => {
    // refetch the trains based on model number
    fetchTrains(model_number);
  };

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setmodel_number(query);

    if (query) {
        try {
            await fetchSuggestions(query);
        } catch (error) {
            console.error("Error fetching suggestions", error);
            setFeedbackMessage('Error fetching suggestions. Please try again.');
            setFeedbackType('error');
        }
    } else {
        setSuggestions([]); // Clear suggestions if the search box is empty
    }
};

  if (isError) {
    return <p>Error loading trains.</p>;
  }

      // Snackbar handlers
      const handleCloseSnackbar = () => {
        setFeedbackMessage('');
    };

    return (
    <Container>
      <Link to="/collection">
        <Button variant="outlined" color="primary">Back to Collection</Button>
      </Link>
      <Typography variant="h4" gutterBottom>Trains</Typography>
      {/* Feedback Message */}
        {feedbackMessage && (
          <div 
              style={{ 
                  marginBottom: '1rem', 
                  padding: '0.5rem', 
                  backgroundColor: feedbackType === 'success' ? 'green' : 'red', 
                  color: 'white',
                  borderRadius: '4px' 
              }}>
              {feedbackMessage}
          </div>
      )}
      <Grid container spacing={3} alignItems="flex-end">
        <Grid item xs={10}>
          <TextField 
              fullWidth 
              label="Search by Model Number" 
              value={model_number} 
              onChange={handleSearchChange}
          />
          {/* Dropdown for suggestions */}
          {suggestions.length > 0 && (
              <Paper style={{maxHeight: 200, width: '100%', overflow: 'auto'}}>
                  <List>
                      {suggestions.map(train => (
                          <ListItem key={train.id} button component={Link} to={`/trains/${train.id}`}>
                              <Typography variant="body1">
                                  <strong>{train.model_number}</strong> - {train.name}
                              </Typography>
                          </ListItem>
                      ))}
                  </List>
              </Paper>
          )}
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
              <TableCell style={{ textAlign: 'center' }}></TableCell>
              <TableCell style={{ textAlign: 'center' }}>Model Number</TableCell>
              <TableCell style={{ textAlign: 'center' }}>Name</TableCell>
              <TableCell style={{ textAlign: 'center' }}>Value</TableCell>
              <TableCell style={{ textAlign: 'center' }}>Details</TableCell>
              <TableCell style={{ textAlign: 'center' }}>Collection </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trains && trains.map(train => (
              <TableRow key={train.id}>
                <TableCell style={{ textAlign: 'center' }}>
                {/* <img 
                    alt={train.model_number} 
                    src={`${train.model_number}.jpg`} 
                    style={{ width: '100px', height: 'auto', marginRight: '10px' }} 
                />
                {train.model_number} */}
                <img 
                  alt='train'
                  src={'./train.png'} 
                  style={{ width: '50px', height: 'auto', marginRight: '10px' }} 
                />
                </TableCell>
                <TableCell style={{ textAlign: 'center' }}>{train.model_number}</TableCell>
                <TableCell style={{ textAlign: 'center' }}>{train.name}</TableCell>
                <TableCell style={{ textAlign: 'center' }}>${train.value}</TableCell>
                <TableCell style={{ textAlign: 'center' }}>
                  <Link to={`/trains/${train.id}`}>View Details</Link>
                  </TableCell>
                  <TableCell style={{ textAlign: 'center' }}>
                  {
                    train.is_in_collection ? (
                      <CheckCircleIcon style={{ color: 'green' }}
                      />
                    ) : (
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => addTrainToCollection(train.id)}
                      >
                        Add to Collection
                      </Button>
                    )
                  }
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      {/* Snackbar for feedback */}
      <Snackbar
              anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
              }}
              open={!!feedbackMessage}
              autoHideDuration={FEEDBACK_DISPLAY_DURATION}
              onClose={handleCloseSnackbar}
          >
              <SnackbarContent 
                  style={{
                      backgroundColor: feedbackType === 'success' ? 'green' : 'red',
                  }}
                  message={
                      <span>
                          {feedbackType === 'error' ? <ErrorIcon /> : <CheckCircleIcon />}
                          {feedbackMessage}
                      </span>
                  }
              />
          </Snackbar>
      </Container>
    );
}

export default TrainList;