import { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useQueryClient } from 'react-query';
import { fetchUserCollection } from './collectionSlice';

export const useAddTrainToCollection = (userId) => {
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState(''); // can be 'success' or 'error'
  
  const queryClient = useQueryClient(); // Initialize queryClient
  
  const addTrainToCollection = async (trainId) => {
    try {
        const response = await axiosInstance.post(`/users/${userId}/collection/${trainId}`);
      
        if (response.status === 200) {
          setFeedbackMessage('Train added to collection successfully!');
          setFeedbackType('success');
          queryClient.invalidateQueries(['trains']);
          queryClient.invalidateQueries(['collection', userId]);
        }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error && err.response.data.error.includes("duplicate key value")) {
        setFeedbackMessage('Train is already in your collection.');
      } else {
        setFeedbackMessage('Error adding train to collection.');
      }
      setFeedbackType('error');
    }
  };

  return {
    addTrainToCollection,
    feedbackMessage,
    feedbackType,
    setFeedbackMessage,
    setFeedbackType
  };
};