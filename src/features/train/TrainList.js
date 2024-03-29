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
import debounce from 'lodash/debounce';
import CircularProgress from '@material-ui/core/CircularProgress';
import { useAddTrainToList} from './useAddTrainToList'
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
  },
  tableContainer: {
    position: 'relative', // This is crucial for the positioning of the button.
    marginTop: '2rem'
  },
  updateButton: {
      position: 'absolute',
      top: '-40px',  // adjust these values to fine-tune positioning
      right: '10px',  // adjust these values to fine-tune positioning
      backgroundColor: 'transparent',
      border: '1px solid #ccc',
      borderRadius: '4px',
      padding: '5px 15px',
      color: '#666',
      '&:hover': {
          backgroundColor: '#f5f5f5',
          color: '#333'
      }
  }
}));

const TrainList = ({ userId: propUserId }) => {
  const classes = useStyles();
  const FEEDBACK_DISPLAY_DURATION = 3000;
  const DEFAULT_PAGE_SIZE = 25;
  const queryClient = useQueryClient();
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
  const [name, setName] = useState(''); // For name search
  const [lastActiveField, setLastActiveField] = useState(null);
  const searchInputRef = React.useRef(null);


  const [isInCollection, setIsInCollection] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const suggestionsRef = React.useRef(null);

  const {
    addTrainToList: addTrainToCollection,
    removeTrainFromList: removeTrainFromCollection,
    feedbackMessage: collectionFeedback,
    feedbackType: collectionFeedbackType,
  } = useAddTrainToList(userId, "collection", setIsInCollection);
  
  const {
    addTrainToList: addTrainToWishlist,
    removeTrainFromList: removeTrainFromWishlist,
    feedbackMessage: wishlistFeedback,
    feedbackType: wishlistFeedbackType,
  } = useAddTrainToList(userId, "wishlist", setIsInWishlist);
  

  const fetchTrains = async (searchType, searchTerm, pageId = currentPage, pageSize = DEFAULT_PAGE_SIZE) => {
    let endpoint = `/trains?page_id=${pageId}&page_size=${pageSize}`;
    
    if (searchType && searchTerm) {
      endpoint = `/trains/search_with_status?search_type=${searchType}&search_terms=${searchTerm}&page_id=${pageId}&page_size=${pageSize}`;
    }
    
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

    const { data: responseData, isError, error, isLoading } = useQuery(
      ['trains', lastActiveField, model_number, name, currentPage], 
      () => fetchTrains(lastActiveField, lastActiveField === 'model' ? model_number : name),
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

  const trains = responseData?.trains || [];
  const hasNoResults = !isSearching && model_number && trains.length === 0;

  console.log("Trains:", trains);
  console.log("Total Pages:", totalPages);
  console.log("Response Data:", responseData);

  useEffect(() => {
    const savedPage = sessionStorage.getItem("trainListCurrentPage");
    if (savedPage) {
      setCurrentPage(Number(savedPage));
    } else {
      setCurrentPage(1);
    }
  }, []);
  

  const handlePageChange = (newPage) => {
    sessionStorage.setItem("trainListCurrentPage", newPage);
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

  const fetchSuggestions = React.useCallback(debounce(async (query, type) => {
    let fetchedData;
    
    fetchedData = await fetchTrains(type, query, 1, 10);

    if (fetchedData && fetchedData.trains) {
      setSuggestions(fetchedData.trains);
    }
  }, 300), []);


  const handleSearchChange = (e, type) => {
    const query = e.target.value;

    if (type === "model") {
        setmodel_number(query);
        setLastActiveField('model');
    } else if (type === "name") {
        setName(query);
        setLastActiveField('name');
    }
  };

  useEffect(() => {
      if ((lastActiveField === 'model' && model_number) || (lastActiveField === 'name' && name)) {
          setIsSearching(true);
          fetchSuggestions(lastActiveField === 'model' ? model_number : name, lastActiveField);
          setIsSearching(false);
      } else {
          setSuggestions([]);  // Clear the suggestions when the search query is empty
      }
  }, [model_number, name, lastActiveField]);

  const handleSearchSubmit = () => {
      setSuggestions([]);
      if (lastActiveField == 'model') {
        setName('')
      } else {
        setmodel_number('')
      }
      queryClient.invalidateQueries(['trains', lastActiveField, currentPage]);
  };

  const handleSuggestionClick = (train) => {
      setSuggestions([]);

      if (lastActiveField === "model") {
          setmodel_number(train.model_number);
          setName('')
      } else if (lastActiveField === "name") {
          setName(train.name);
          setmodel_number('')
      }

      queryClient.invalidateQueries(['trains', lastActiveField, model_number, name, currentPage]);
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
        label="Search by Name" 
        value={name} 
        onChange={(e) => handleSearchChange(e, "name")}
      />
      <TextField 
          fullWidth 
          label="Search by Model Number" 
          value={model_number} 
          onChange={(e) => handleSearchChange(e, "model")}
      />
      { suggestions.length > 0 && (
        <Paper className={classes.suggestionsDropdown} ref={suggestionsRef}>
              <List>
                  {suggestions.map(train => (
                    <ListItem key={train.id} button onClick={() => handleSuggestionClick(train)}>
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
      { (user.isAdmin || user.id === 1) && 
      (!showForm ? (
        <Button onClick={() => setShowForm(true)}>Need to add a train?</Button>
      ):         
        <Button onClick={() => setShowForm(false)}>Nevermind!</Button>
      )
    }
    { (showForm ? (
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
    ): null
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
      <Paper className={classes.tableContainer}>
      <Link to="/admin/train_values">
          <Button className={classes.updateButton}>Update Train Values</Button>
      </Link>
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
                <img alt='train' src= {train.img_url || "/train.png"}
                  style={{ width: '120px', height: 'auto', marginRight: '10px' }} 
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
      <Grid container justifyContent="center" className={classes.marginTop}>
          <Pagination 
              count={totalPages} 
              page={currentPage} 
              onChange={(event, value) => handlePageChange(value)}
          />
      </Grid>
      <div style={{ marginBottom: '5rem'}}>
      </div>
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