import { useState, useCallback } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useQueryClient } from 'react-query';
import { fetchUserCollection } from './collectionSlice';


export const useIsTrainInCollection = (userId, trainId) => {
    const [isInCollection, setIsInCollection] = useState(false);
  
    const checkTrainInCollection = useCallback(async (trainId) => {
        try {
            const response = await axiosInstance.get(`/users/${userId}/collection/trains/${trainId}`);
            setIsInCollection(response.data.isInCollection); // Assuming the API responds with { isInCollection: true/false }
        } catch (error) {
            console.error('Error checking train in collection:', error);
            // Optionally, handle sthe error more gracefully
        }
    }, [userId]);
  
    return {
        isInCollection,
        checkTrainInCollection
    };
  };
  