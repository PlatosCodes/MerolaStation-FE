import React, { useState, useEffect } from 'react';
import {
  Table, TableHead, TableRow, TableCell, TableBody, Typography, 
  TextField, Container, Paper, Grid, IconButton, Button, List, ListItem,
  Snackbar, SnackbarContent, makeStyles
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import ErrorIcon from '@material-ui/icons/Error';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../user/userSlice';
import axiosInstance from '../../api/axiosInstance';
import debounce from 'lodash/debounce';
import CircularProgress from '@material-ui/core/CircularProgress';
import { useAddTrainToCollection } from '../collection/useAddTrainToCollection'; // Adjust path if needed
import { useAddTrainToWishlist } from '../wishlist/useAddTrainToWishlist'; // Adjust path if needed
import Pagination from '@material-ui/lab/Pagination';

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

const FEEDBACK_DISPLAY_DURATION = 3000;
const DEFAULT_PAGE_SIZE = 25;

const TrainList = ({ userId: propUserId }) => {
  const classes = useStyles();

  const [model_number, setmodel_number] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('');
  const user = useSelector(selectUser);
  const userId = propUserId || user.id;
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [newTrain, setNewTrain] = useState({
        model_number: "",
        train_name: ""
  });
  const {
    addTrainToCollection,
  } = useAddTrainToCollection(userId); 

  const {
    addTrainToWishlist,
  } = useAddTrainToWishlist(userId);

  const fetchTrains = async (model_number, pageId = currentPage, pageSize = DEFAULT_PAGE_SIZE) => {
    const endpoint = model_number 
      ? `/trains/search?model_number=${model_number}&page_id=${pageId}&page_size=${pageSize}`
      : `/trains?page_id=${pageId}&page_size=${pageSize}`;
  
    try {
      const response = await axiosInstance.get(endpoint);
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error("Unexpected server response");
      }
    } catch (error) {
      setFeedbackMessage('Error fetching trains. Please try again later.');
      setFeedbackType('error');
      console.error("Error fetching trains:", error);
      return null;
    }
  };

  const { data: responseData, isError, error, isLoading, refetch } = useQuery(
    ['trains', model_number, currentPage], 
    () => fetchTrains(model_number),
    { 
      onSuccess: responseData => {
        const count = responseData?.total_count || 0;
        setTotalPages(Math.ceil(count / DEFAULT_PAGE_SIZE));
      },
      onError: (error) => {
        setFeedbackMessage(error.message || 'Error fetching trains. Please try again.');
        setFeedbackType('error');
      }
    }
  );
  

const [isSearching, setIsSearching] = useState(false);

const searchInputRef = React.useRef(null);

const trains = responseData?.trains || [];
const hasNoResults = !isSearching && model_number && trains.length === 0;

  console.log("Trains:", trains);
  console.log("Total Pages:", totalPages);
  console.log("Response Data:", responseData);



  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };


  const handleNewTrainSubmit = async () => {
    if (!newTrain.model_number.trim() || !newTrain.train_name.trim()) {
        setFeedbackMessage('Please provide both Model Number and Train Name.');
        setFeedbackType('error');
        return;
    }

    setIsSubmitting(true);  

    try {
        const response = await axiosInstance.post('/trains', newTrain);
        if (response.status === 200) {
            setNewTrain({ model_number: "", train_name: "" });
            setShowForm(false);
            setFeedbackMessage('Train successfully added!');
            setFeedbackType('success');
        } else {
            setFeedbackMessage('Something went wrong. Please try again.');
            setFeedbackType('error');
        }
    } catch (error) {
        setFeedbackMessage('Error adding train. Please try again.');
        setFeedbackType('error');
    }

    setIsSubmitting(false);  
};

const fetchSuggestions = React.useCallback(debounce(async (query) => {
  try {
    const fetchedData = await fetchTrains(query, 1, 10);
    if (fetchedData && fetchedData.trains) {
      setSuggestions(fetchedData.trains);
    }
  } catch (error) {
    console.error("Error fetching suggestions", error);
  }
}, 300), []);


  const handleSearchSubmit = () => {
    setIsSearching(true);
    refetch().then(() => {
      setIsSearching(false);
    });
    setCurrentPage(1);
  };
  
  

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setmodel_number(query);
    if (query) {
        setIsSearching(true);
        await fetchSuggestions(query);
        setIsSearching(false);
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
    } else {
        setSuggestions([]);
    }
  };
  

  // Snackbar handlers
  const handleCloseSnackbar = () => {
    setFeedbackMessage('');
  };

  // if (isLoading) {
  //   return (
  //     <div className={classes.centeredText}>
  //       <CircularProgress />
  //       <p>Loading trains...</p>
  //     </div>
  //   );
  // }

  if (isError) {
      return <p>Error loading trains.</p>;
  }

    return (
    <Container>
      <div style={{padding: '10px'}}></div>
      {/* <Link to="/collection">
        <Button variant="outlined" color="primary">Back to Collection</Button>
      </Link> */}
      <Typography variant="h4" align='center' gutterBottom>Train List</Typography>
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
              ref={searchInputRef}
          />
          { suggestions.length > 0 && (
            <Paper className={classes.suggestionsDropdown}>
                <List>
                    {suggestions.map(train => (
                      <ListItem key={train.id} button onClick={() => {
                        setmodel_number(train.model_number);
                        handleSearchSubmit();
                      }}>
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

      {showForm ? (
        <div>
          <TextField 
              label="Model Number" 
              value={newTrain.model_number} 
              onChange={(e) => setNewTrain(prev => ({ ...prev, model_number: e.target.value }))}
          />
          <TextField 
              label="Train Name" 
              value={newTrain.train_name} 
              onChange={(e) => setNewTrain(prev => ({ ...prev, train_name: e.target.value }))}
          />
          <Button onClick={handleNewTrainSubmit}>Submit</Button>
        </div>
      ) : (
        <Button onClick={() => setShowForm(true)}>Need to add a train?</Button>
        )}
      <Grid container justifyContent="center" className={classes.marginTop}>
          <Pagination 
              count={totalPages} 
              page={currentPage} 
              onChange={(event, value) => handlePageChange(value)}
          />
      </Grid>
      {isLoading && (
      <div className={classes.centeredText}>
        <CircularProgress />
        <p>Loading trains...</p>
      </div>
    )}
    {!isLoading && (
      <Paper style={{ marginTop: '2rem' }}>
      {hasNoResults ? (
        <Typography className={classes.centeredText} variant="h5">
          There are no results matching your search.
        </Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell style={{ textAlign: 'center' }}></TableCell>
              <TableCell style={{ textAlign: 'center' }}>Model Number</TableCell>
              <TableCell style={{ textAlign: 'center' }}>Name</TableCell>
              <TableCell style={{ textAlign: 'center' }}>Value</TableCell>
              <TableCell style={{ textAlign: 'center' }}>Details</TableCell>
              <TableCell style={{ textAlign: 'center' }}>Collection </TableCell>
              <TableCell style={{ textAlign: 'center' }}>Wishlist </TableCell>

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
                <TableCell style={{ textAlign: 'center' }}>
                { train.is_in_wishlist ? (
                    <CheckCircleIcon style={{ color: 'blue' }}/>
                  ) : (
                      <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => addTrainToWishlist(train.id)}
                      >
                          Add to Wishlist
                      </Button>
                  )
                  }
                </TableCell>
                
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      </Paper>   
       )}
      
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