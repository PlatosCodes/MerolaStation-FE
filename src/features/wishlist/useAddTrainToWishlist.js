import { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useQueryClient } from 'react-query';
import { fetchUserWishlist } from './wishlistSlice';

export const useAddTrainToWishlist = (userId) => {
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState(''); // can be 'success' or 'error'
  
  const queryClient = useQueryClient(); // Initialize queryClient
  
  const addTrainToWishlist = async (trainId) => {
    try {
        const response = await axiosInstance.post(`/users/${userId}/wishlist/${trainId}`);
      
        if (response.status === 200) {
          setFeedbackMessage('Train added to wishlist successfully!');
          setFeedbackType('success');
          queryClient.invalidateQueries(['trains']);
          queryClient.invalidateQueries(['wishlist', userId]);
        }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error && err.response.data.error.includes("duplicate key value")) {
        setFeedbackMessage('Train is already in your wishlist.');
      } else {
        setFeedbackMessage('Error adding train to wishlist.');
      }
      setFeedbackType('error');
    }
  };

  return {
    addTrainToWishlist,
    feedbackMessage,
    feedbackType,
    setFeedbackMessage,
    setFeedbackType
  };
};