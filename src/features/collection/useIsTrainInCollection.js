import { useState, useCallback } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useQueryClient } from 'react-query';
import { fetchUserCollection } from './collectionSlice';


export const useIsTrainInCollection = (userID, trainID) => {
    const [isInCollection, setIsInCollection] = useState(false);
  
    const checkTrainInCollection = useCallback(async (trainID) => {
        try {
            const response = await axiosInstance.get(`/users/${userID}/collection/${trainID}`);
            if (response.status === 200) {
                setIsInCollection(true); // Assuming the API responds with { isInCollection: true/false }
                isInCollection = true;
            }
        } catch (error) {
            console.error('Error checking train in collection:', error);
            setIsInCollection(false);
            isInCollection = false;
            // Optionally, handle sthe error more gracefully
        }
    }, [userID]);
  
    return {
        isInCollection,
        checkTrainInCollection
    };
  };
  