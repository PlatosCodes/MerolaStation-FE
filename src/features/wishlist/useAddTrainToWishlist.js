import { useState, useCallback } from 'react';
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

  const removeTrainFromWishlist = async (userId, trainId) => {
    try {
        await axiosInstance.delete(`/users/${userId}/wishlist/${trainId}`);
    } catch (error) {
        console.error('Error removing train from wishlist:', error);
    }
};

return {
    addTrainToWishlist,
    removeTrainFromWishlist,
    feedbackMessage,
    feedbackType,
    setFeedbackMessage,
    setFeedbackType
};
};


export const useIsTrainInWishlist = (userId, trainId) => {
  const [isInWishlist, setIsInWishlist] = useState(false);

  const checkTrainInWishlist = useCallback(async (trainId) => {
      try {
          const response = await axiosInstance.get(`/users/${userId}/wishlist/${trainId}`);
          setIsInWishlist(response.data.isInWishlist);
      } catch (error) {
          console.error('Error checking train in wishlist:', error);
          // Optionally, you can handle the error more gracefully, e.g., set an error state
      }
  }, [userId]);

  return {
      isInWishlist,
      checkTrainInWishlist
  };
};
